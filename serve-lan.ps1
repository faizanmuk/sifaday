# SIFAAIZ — Wi-Fi server, so a phone on the same Wi-Fi can open the site.
# Run:  powershell -ExecutionPolicy Bypass -File serve-lan.ps1
# Then open on the phone:  http://<this PC's IP>:8126   (Ctrl+C to stop)
# Windows may ask (once) whether to allow it through the firewall. Click "Allow".
# Serves only this folder (never _backup or scripts), many requests at once,
# with byte ranges so the video and songs can seek.
param([int]$Port = 8126)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$code = @"
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public static class SifaaizLanServer {
  static string Root;
  static readonly Dictionary<string, string> Types = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase) {
    {".html","text/html; charset=utf-8"}, {".css","text/css; charset=utf-8"}, {".js","text/javascript; charset=utf-8"},
    {".svg","image/svg+xml"}, {".png","image/png"}, {".jpg","image/jpeg"}, {".jpeg","image/jpeg"}, {".webp","image/webp"},
    {".avif","image/avif"}, {".woff2","font/woff2"}, {".mp3","audio/mpeg"}, {".m4a","audio/mp4"}, {".ogg","audio/ogg"},
    {".wav","audio/wav"}, {".mp4","video/mp4"}, {".mov","video/quicktime"}, {".webm","video/webm"}, {".txt","text/plain; charset=utf-8"}
  };

  public static void Run(string root, int port) {
    Root = Path.GetFullPath(root).TrimEnd('\\') + "\\";
    var listener = new TcpListener(IPAddress.Any, port);
    listener.Start();
    while (true) {
      var client = listener.AcceptTcpClient();
      ThreadPool.QueueUserWorkItem(delegate { Handle(client); });
    }
  }

  static string ReadLine(Stream s) {
    var sb = new StringBuilder();
    int b;
    while ((b = s.ReadByte()) != -1) {
      if (b == '\n') return sb.ToString().TrimEnd('\r');
      sb.Append((char)b);
      if (sb.Length > 8192) return null;
    }
    return sb.Length > 0 ? sb.ToString() : null;
  }

  static void Write(Stream s, string text) { var b = Encoding.ASCII.GetBytes(text); s.Write(b, 0, b.Length); }

  static void Handle(TcpClient client) {
    try {
      using (client) {
        client.ReceiveTimeout = 20000; client.SendTimeout = 120000;
        var s = client.GetStream();
        string line = ReadLine(s);
        if (line == null) return;
        var parts = line.Split(' ');
        if (parts.Length < 2) return;
        string method = parts[0], target = parts[1], range = null, h;
        while (!string.IsNullOrEmpty(h = ReadLine(s))) {
          if (h.StartsWith("Range:", StringComparison.OrdinalIgnoreCase)) range = h.Substring(6).Trim();
        }
        string rel = Uri.UnescapeDataString(target.Split('?')[0]).TrimStart('/');
        if (rel == "") rel = "index.html";
        string path = Path.GetFullPath(Path.Combine(Root, rel.Replace('/', '\\')));
        string ext = Path.GetExtension(path);
        bool blocked = rel.StartsWith("_backup", StringComparison.OrdinalIgnoreCase) || ext.Equals(".ps1", StringComparison.OrdinalIgnoreCase);
        if (!path.StartsWith(Root, StringComparison.OrdinalIgnoreCase) || blocked || !File.Exists(path)) {
          Write(s, "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
          return;
        }
        long len = new FileInfo(path).Length, start = 0, end = len - 1;
        bool partial = false;
        if (range != null && range.StartsWith("bytes=") && len > 0) {
          var r = range.Substring(6).Split(',')[0].Split('-');
          if (r[0] == "" && r.Length > 1 && r[1] != "") { start = Math.Max(0, len - long.Parse(r[1])); }
          else {
            start = long.Parse(r[0]);
            if (r.Length > 1 && r[1] != "") end = Math.Min(long.Parse(r[1]), len - 1);
          }
          if (start > end || start >= len) {
            Write(s, "HTTP/1.1 416 Range Not Satisfiable\r\nContent-Range: bytes */" + len + "\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
            return;
          }
          partial = true;
        }
        string type; if (!Types.TryGetValue(ext, out type)) type = "application/octet-stream";
        long count = end - start + 1;
        var head = new StringBuilder();
        head.Append(partial ? "HTTP/1.1 206 Partial Content\r\n" : "HTTP/1.1 200 OK\r\n");
        head.Append("Content-Type: " + type + "\r\n");
        head.Append("Content-Length: " + count + "\r\n");
        head.Append("Accept-Ranges: bytes\r\n");
        if (partial) head.Append("Content-Range: bytes " + start + "-" + end + "/" + len + "\r\n");
        head.Append("Cache-Control: no-cache\r\nConnection: close\r\n\r\n");
        Write(s, head.ToString());
        if (method == "HEAD") return;
        using (var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
          fs.Seek(start, SeekOrigin.Begin);
          var buf = new byte[65536];
          while (count > 0) {
            int n = fs.Read(buf, 0, (int)Math.Min(buf.Length, count));
            if (n <= 0) break;
            s.Write(buf, 0, n);
            count -= n;
          }
        }
      }
    } catch { /* phone closed the connection (normal when seeking) */ }
  }
}
"@

Add-Type -TypeDefinition $code -Language CSharp

$ips = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notlike 'vEthernet*' } |
  Select-Object -ExpandProperty IPAddress
Write-Host "Serving $root"
foreach ($ip in $ips) { Write-Host "Open on your phone (same Wi-Fi):  http://${ip}:$Port" }
Write-Host "Press Ctrl+C to stop."
[SifaaizLanServer]::Run($root, $Port)

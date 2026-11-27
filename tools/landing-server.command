#!/bin/bash
# LoadCash 落地页 — 一键本地服务器（在 Finder 里双击，或在终端运行 tools/landing-server.command）。
# 参考 MocaMoca 的 tools/landing-server.command：
#
# - 端口固定 5174（永远不变；5173 留给 MocaMoca）。如果是旧的 LoadCash 落地页服务器占着，就先关掉再重开；如果是别的程序占着，脚本停下并告诉你是哪个，
#   绝不换端口。
# - 第一次运行会自动安装依赖（npm install），启动后自动用浏览器打开页面。
# - 每 2 秒检查一次：服务器是否还在 5174 上响应（停了就在同一个端口重启）；这台 Mac 的网络地址是否变了（换 Wi-Fi、开热点、插数据线），
#   变了会响一声、弹通知、显示新地址。
# - .local 地址（这台 Mac 的名字）在 Wi-Fi 换号码时也不变 —— iPhone 上能打开就优先用它。
# - 改代码页面会自动刷新（Vite 热更新）。
# - 同时只有一个窗口管这个端口：再双击一次，新窗口接管，旧窗口自己退出（不会两个窗口互相重启对方的服务器）。
#   Claude 应用里的页面预览用 5175（.claude/launch.json），不和这里抢 5174。
# 停止：Ctrl+C（或者直接关掉窗口）。

PORT=5174
[ -n "$LOADCASH_TEST_PORT" ] && PORT="$LOADCASH_TEST_PORT"   # 只用于检查脚本本身；平时一直是 5174
PREFIX=/
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/landing"
LOG="${TMPDIR:-/tmp}/loadcash-landing-server.log"
SERVER_PID=""

# 从 Finder 双击时 PATH 很短：补上常见的 node 位置（Homebrew / 官方安装包 / nvm）
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1

say_cn() { printf '%s\n' "$*"; }
now() { date '+%H:%M:%S'; }

stop_server() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null; fi
}
trap 'printf "\n"; stop_server; say_cn "已停止，端口 $PORT 已释放。"; exit 0' INT TERM

# 只允许一个窗口管这个端口：再开一次脚本，新窗口接管，旧窗口自己关掉服务器退出（不会两个窗口互相关对方的服务器）
LOCK="${TMPDIR:-/tmp}/loadcash-landing-server-$PORT.pid"
owns_lock() { [ "$(cat "$LOCK" 2>/dev/null)" = "$$" ]; }
trap 'stop_server; owns_lock && rm -f "$LOCK"' EXIT
others="$(cat "$LOCK" 2>/dev/null)"
# 没有锁文件的旧版脚本窗口（加锁之前开的）也算：只在正式端口上找，检查脚本用的测试端口不碰它们
[ "$PORT" = "5174" ] && others="$others $(pgrep -f "$ROOT/tools/landing-server.command" 2>/dev/null)"
for old in $others; do
  [ "$old" = "$$" ] && continue
  ps -o command= -p "$old" 2>/dev/null | grep -q 'landing-server.command' || continue
  say_cn "已经有一个 LoadCash 落地页服务器窗口在运行（PID ${old}），由这个新窗口接管…"
  kill -TERM "$old" 2>/dev/null
  for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do kill -0 "$old" 2>/dev/null || break; sleep 0.3; done
  kill -0 "$old" 2>/dev/null && kill -9 "$old" 2>/dev/null
done
echo "$$" > "$LOCK"

# 0. 环境：node 和依赖
command -v node >/dev/null 2>&1 || { say_cn "找不到 node。请先安装 Node.js（https://nodejs.org），再重新运行。"; exit 1; }
if [ ! -x "$APP/node_modules/.bin/vite" ]; then
  say_cn "第一次运行：正在安装依赖（npm install），大约一分钟…"
  (cd "$APP" && npm install --no-audit --no-fund) || { say_cn "依赖安装失败，见上面的报错。"; exit 1; }
fi

# 1. 确保端口 5174 是我们的（绝不换端口）
free_port() {
  local pid cmd
  pid="$(lsof -ti tcp:$PORT -sTCP:LISTEN 2>/dev/null | head -1)"
  [ -z "$pid" ] && return 0
  cmd="$(ps -o command= -p "$pid" 2>/dev/null)"
  case "$cmd" in
    *"$APP/node_modules/"*vite*|*landing*node_modules/.bin/vite*)
      say_cn "端口 $PORT 上已有一个旧的 LoadCash 落地页服务器（PID ${pid}），先把它关掉…"
      kill "$pid" 2>/dev/null
      for i in 1 2 3 4 5 6 7 8 9 10; do lsof -ti tcp:$PORT -sTCP:LISTEN >/dev/null 2>&1 || return 0; sleep 0.3; done
      kill -9 "$pid" 2>/dev/null; sleep 0.5
      lsof -ti tcp:$PORT -sTCP:LISTEN >/dev/null 2>&1 && { say_cn "关不掉 PID ${pid}，端口 $PORT 仍被占用。"; exit 1; }
      return 0 ;;
    *)
      say_cn "端口 $PORT 被别的程序占用了（PID ${pid}）："
      say_cn "  $cmd"
      say_cn "为了保证端口不变，脚本不会换端口。请先关掉这个程序，再重新运行。"
      exit 1 ;;
  esac
}

start_server() {
  free_port
  # --host 0.0.0.0：同一网络里的手机也能打开；--strictPort：端口被占就报错，不会悄悄换端口
  (cd "$APP" && exec ./node_modules/.bin/vite --host 0.0.0.0 --port "$PORT" --strictPort) >"$LOG" 2>&1 &
  SERVER_PID=$!
  for i in $(seq 1 40); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$PREFIX")" = "200" ] && return 0
    kill -0 "$SERVER_PID" 2>/dev/null || break
    sleep 0.3
  done
  say_cn "服务器没能启动，日志："; cat "$LOG"; exit 1
}

# 手机能用的 IPv4 地址（每行 "网卡 地址"），去掉回环和链路本地地址
addresses() {
  ifconfig 2>/dev/null | awk '/^[a-z0-9]+:/ { name=$1; sub(":", "", name) } /inet / { ip=$2; if (ip !~ /^127\./ && ip !~ /^169\.254\./) print name " " ip }'
}
local_name() { local n; n="$(scutil --get LocalHostName 2>/dev/null)"; [ -n "$n" ] && printf '%s.local' "$n"; }

show_addresses() {
  local name ip tag code ok
  say_cn ""
  say_cn "  在这台电脑上：  http://localhost:$PORT$PREFIX"
  if [ -z "$1" ]; then
    say_cn "  在 iPhone 上：  （现在没有网络地址：请连上 Wi-Fi，或者打开 iPhone 个人热点并插上数据线）"
  else
    printf '%s\n' "$1" | while read -r name ip; do
      case "$ip" in 172.20.10.*) tag="数据线（iPhone 热点）· 用这个";; *) tag="Wi-Fi / 网络（${name}）";; esac
      code="$(curl -s -m 2 -o /dev/null -w '%{http_code}' "http://$ip:$PORT$PREFIX")"
      [ "$code" = "200" ] && ok="可访问" || ok="这台电脑上访问不到（${code}）"
      say_cn "  在 iPhone 上：  http://$ip:$PORT$PREFIX    $tag · $ok"
    done
  fi
  [ -n "$LOCALNAME" ] && say_cn "  不变的地址：    http://$LOCALNAME:$PORT$PREFIX    （这台 Mac 的名字：数据线、Wi-Fi 都能用，号码变了也不变）"
  say_cn ""
}

# 数据线：iPhone 插在 USB 上时只有打开个人热点才能连到这台 Mac —— 这时 "iPhone USB" 网络会拿到 172.20.10.x 地址。
# 状态：none（没插 iPhone）· nohotspot（插了，热点没开）· ok <地址>
cable_state() {
  local dev ip
  ioreg -p IOUSB -w0 2>/dev/null | grep -q -- '-o iPhone@' || { echo none; return; }
  dev="$(networksetup -listallhardwareports 2>/dev/null | awk '/Hardware Port: iPhone USB/ { getline; print $2; exit }')"
  ip="$( [ -n "$dev" ] && ifconfig "$dev" 2>/dev/null | awk '/inet 172\.20\.10\./ { print $2; exit }')"
  [ -z "$ip" ] && ip="$(ifconfig 2>/dev/null | awk '/inet 172\.20\.10\./ { print $2; exit }')"
  [ -n "$ip" ] && echo "ok $ip" || echo nohotspot
}
show_cable() {
  case "$1" in
    none) say_cn "  数据线：iPhone 没有插在这台 Mac 上。" ;;
    nohotspot)
      say_cn "  📱 数据线：iPhone 已插上，但个人热点没有通过数据线分配地址（没有 172.20.10.x）。"
      say_cn "      在 iPhone 上打开：  http://$LOCALNAME:$PORT$PREFIX    （走数据线，不需要热点）"
      say_cn "      打不开的话：iPhone 解锁，个人热点关掉再打开，拔掉数据线再插上；连通后这里会自动显示 172.20.10.x 地址。" ;;
    ok\ *)
      say_cn "  ✅ 数据线已连通 —— 在 iPhone 上打开：  http://${1#ok }:$PORT$PREFIX" ;;
  esac
}

notify() { osascript -e "display notification \"$1\" with title \"LoadCash 落地页\" sound name \"Glass\"" >/dev/null 2>&1; }

# 2. 启动并守着
say_cn ""
say_cn "LoadCash 落地页本地服务器 · 端口固定 $PORT · 文件一改页面就自动刷新 · Ctrl+C 停止"
start_server
LOCALNAME="$(local_name)"
LAST="$(addresses)"
say_cn "[$(now)] 已启动（PID ${SERVER_PID}）。"
show_addresses "$LAST"
CABLE="$(cable_state)"
show_cable "$CABLE"; say_cn ""
[ -z "$LOADCASH_NO_OPEN" ] && open "http://localhost:$PORT$PREFIX"   # 自动在默认浏览器里打开

while true; do
  sleep 2
  # 另一个窗口接管了这个端口：这个窗口不再管服务器，直接退出（不去关新窗口的服务器）
  if ! owns_lock; then printf '\n'; say_cn "[$(now)] 另一个窗口接管了端口 $PORT，这个窗口退出。"; SERVER_PID=""; exit 0; fi
  # 服务器：还在 5174 上、还在响应吗？不在就在同一个端口重启
  code="$(curl -s -m 2 -o /dev/null -w '%{http_code}' "http://localhost:$PORT$PREFIX")"
  if ! kill -0 "$SERVER_PID" 2>/dev/null || [ "$code" != "200" ]; then
    printf '\n'; say_cn "[$(now)] 服务器没有响应（${code}），在同一个端口 $PORT 上重新启动…"
    stop_server; start_server
    say_cn "[$(now)] 已重新启动（PID ${SERVER_PID}），端口仍是 ${PORT}。"; notify "服务器已在端口 $PORT 重新启动"
  fi
  # 地址：变了吗？
  CUR="$(addresses)"
  if [ "$CUR" != "$LAST" ]; then
    printf '\a\n'
    say_cn "[$(now)] ⚠️  地址变了！端口没变，仍是 ${PORT}。"
    [ -n "$LAST" ] && say_cn "  原来：$(printf '%s' "$LAST" | awk '{print $2}' | tr '\n' ' ')"
    say_cn "  现在：$(printf '%s' "$CUR" | awk '{print $2}' | tr '\n' ' ')"
    show_addresses "$CUR"
    notify "地址变了：$(printf '%s' "$CUR" | awk '{print $2}' | tr '\n' ' ')· 端口仍是 $PORT"
    LAST="$CUR"
    CABLE=""
  fi
  # 数据线：插上了吗？热点开了吗？
  C="$(cable_state)"
  if [ "$C" != "$CABLE" ]; then
    printf '\a\n'; say_cn "[$(now)] 数据线状态变了："; show_cable "$C"; say_cn ""
    case "$C" in
      nohotspot) notify "iPhone 已插上：在手机上打开 http://$LOCALNAME:$PORT$PREFIX" ;;
      ok\ *) notify "数据线已连通：http://${C#ok }:$PORT$PREFIX" ;;
    esac
    CABLE="$C"
  else
    case "$C" in none) cs="未插 iPhone";; nohotspot) cs="数据线：用 $LOCALNAME";; *) cs="数据线 ${C#ok }";; esac
    printf '\r[%s] ✓ 端口 %s 正常 · %s · 地址：%s   ' "$(now)" "$PORT" "$cs" "$(printf '%s' "$CUR" | awk '{print $2}' | tr '\n' ' ')"
  fi
done

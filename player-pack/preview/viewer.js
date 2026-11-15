(() => {
  "use strict";
  const { manifest: m, images } = window.PLAYER_PACK,
    $ = (id) => document.getElementById(id),
    cache = new Map(),
    stage = $("stage").getContext("2d"),
    strip = $("turnaround").getContext("2d");
  let player = "player_female",
    direction = "S",
    elapsed = 0,
    last = 0,
    paused = matchMedia("(prefers-reduced-motion: reduce)").matches,
    raf = 0,
    dirty = true,
    serial = 0,
    lastKey = "";
  for (const p of m.players) {
    const b = document.createElement("button");
    b.dataset.player = p.id;
    b.type = "button";
    const im = document.createElement("img");
    im.src = images[`portraits/${p.id}.png`];
    im.alt = "";
    const text = document.createElement("span"),
      strong = document.createElement("strong"),
      small = document.createElement("small");
    strong.textContent = p.label;
    small.textContent = p.heightCm + " cm";
    text.append(strong, small);
    b.append(im, text);
    b.onclick = () => {
      player = p.id;
      info();
      invalidate();
    };
    $("choices").append(b);
  }
  for (const d of ["NW", "N", "NE", "W", "•", "E", "SW", "S", "SE"]) {
    if (d === "•") {
      const s = document.createElement("span");
      s.textContent = "•";
      $("compass").append(s);
      continue;
    }
    const b = document.createElement("button");
    b.textContent = d;
    b.dataset.direction = d;
    b.type = "button";
    b.onclick = () => {
      direction = d;
      info();
      invalidate();
    };
    $("compass").append(b);
  }
  function info() {
    const p = m.players.find((p) => p.id === player);
    $("appearance").textContent = p.appearance;
    document
      .querySelectorAll("[data-player]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.player === player)),
      );
    document
      .querySelectorAll("[data-direction]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.direction === direction),
        ),
      );
  }
  function schedule() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function invalidate() {
    dirty = true;
    schedule();
  }
  function pauseUI() {
    $("pause").textContent = paused ? "Play" : "Pause";
    $("pause").setAttribute("aria-pressed", String(paused));
  }
  for (const id of ["action", "variant", "resolution"])
    $(id).addEventListener("change", () => {
      if (id === "action") elapsed = 0;
      invalidate();
    });
  $("pause").onclick = () => {
    paused = !paused;
    last = 0;
    pauseUI();
    schedule();
  };
  $("replay").onclick = () => {
    elapsed = 0;
    invalidate();
  };
  $("step").onclick = () => {
    paused = true;
    pauseUI();
    const s = sheet();
    elapsed += 1000 / s.fps + 0.001;
    invalidate();
  };
  document.addEventListener("visibilitychange", () => {
    last = 0;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else schedule();
  });
  function sheet() {
    return m.sheets.find(
      (s) =>
        s.player === player &&
        s.variant === $("variant").value &&
        s.action === $("action").value,
    );
  }
  function image(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("Image decode failed: " + path));
      im.src = images[path];
    });
    cache.set(path, promise);
    return promise;
  }
  function grid(ctx, s) {
    const a =
        (m.sheets[0].rows.find((r) => r.direction === direction).yawDegrees *
          Math.PI) /
        180,
      travel =
        $("action").value === "walk"
          ? (Math.floor((elapsed * sheet().fps) / 1000) / sheet().fps) *
            m.movement.worldUnitsPerSecond
          : 0,
      dx = Math.sin(a) * travel,
      dy = -Math.cos(a) * travel,
      origin = { x: 96 + m.frame.origin.x * 2, y: m.frame.origin.y * 2 };
    ctx.strokeStyle = "#172438";
    ctx.lineWidth = 1;
    function line(x1, y1, x2, y2) {
      const q = Math.SQRT1_2,
        a = (x1 - y1) * q,
        b = (x1 + y1) * q,
        c = (x2 - y2) * q,
        d = (x2 + y2) * q;
      ctx.beginPath();
      ctx.moveTo(origin.x + (a - dx) * s, origin.y - (b - dy) * 0.5 * s);
      ctx.lineTo(origin.x + (c - dx) * s, origin.y - (d - dy) * 0.5 * s);
      ctx.stroke();
    }
    const bx = Math.floor(((dx + dy) * Math.SQRT1_2) / 12) * 12,
      by = Math.floor(((dy - dx) * Math.SQRT1_2) / 12) * 12;
    for (let k = -12; k <= 12; k++) {
      line(bx + k * 12, by - 144, bx + k * 12, by + 144);
      line(bx - 144, by + k * 12, bx + 144, by + k * 12);
    }
  }
  async function render() {
    const s = sheet(),
      index = Math.floor((elapsed * s.fps) / 1000) % s.frameCount,
      low = $("resolution").value === "gameplay",
      factor = low ? 0.125 : $("resolution").value === "compact" ? 0.5 : 1;
    const key = [
      player,
      direction,
      s.variant,
      s.action,
      $("resolution").value,
      s.action === "walk" ? Math.floor((elapsed * s.fps) / 1000) : index,
    ].join("/");
    if (key === lastKey) return;
    lastKey = key;
    const mine = ++serial;
    try {
      const im = await image(
        low
          ? s.gameplayPath
          : $("resolution").value === "compact"
            ? s.compactPath
            : s.path,
      );
      if (mine !== serial) return;
      stage.imageSmoothingEnabled = false;
      strip.imageSmoothingEnabled = false;
      stage.clearRect(0, 0, 448, 384);
      strip.clearRect(0, 0, 1024, 224);
      grid(stage, 4);
      for (let i = 0; i < s.rows.length; i++) {
        const row = s.rows[i],
          f = row.frames[index],
          r = f.rect;
        strip.drawImage(
          im,
          r.x * factor,
          r.y * factor,
          r.width * factor,
          r.height * factor,
          i * 128,
          0,
          128,
          192,
        );
        strip.fillStyle = row.direction === direction ? "#d29b66" : "#98a9b7";
        strip.font = "14px sans-serif";
        strip.fillText(row.direction, i * 128 + 48, 214);
        if (row.direction === direction) {
          stage.drawImage(
            im,
            r.x * factor,
            r.y * factor,
            r.width * factor,
            r.height * factor,
            96,
            0,
            256,
            384,
          );
          $("status").textContent =
            player +
            " · " +
            direction +
            " · " +
            s.action +
            " · Frame " +
            (index + 1) +
            "/" +
            s.frameCount +
            " · " +
            (f.footPlant[0] ? "Left planted" : "Left swing") +
            " / " +
            (f.footPlant[1] ? "Right planted" : "Right swing");
        }
      }
    } catch (e) {
      $("status").textContent = e.message;
      paused = true;
      pauseUI();
    }
  }
  function tick(now) {
    raf = 0;
    if (last && !paused) {
      elapsed += Math.min(now - last, 100);
      dirty = true;
    }
    last = now;
    if (dirty) {
      dirty = false;
      render();
    }
    if (!paused) schedule();
  }
  info();
  pauseUI();
  schedule();
})();

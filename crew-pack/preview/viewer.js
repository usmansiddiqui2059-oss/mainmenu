/* Vanilla preview; embedded images work with file:// and need no server. */
(() => {
  "use strict";
  const { manifest: m, images } = window.CREW_PACK,
    $ = (id) => document.getElementById(id),
    action = $("action"),
    variant = $("variant"),
    direction = $("direction"),
    resolution = $("resolution"),
    pause = $("pause"),
    stage = $("stage").getContext("2d"),
    lineup = $("crew").getContext("2d"),
    cache = new Map();
  let selected = m.crew[0].id,
    elapsed = 0,
    last = 0,
    paused = matchMedia("(prefers-reduced-motion: reduce)").matches,
    dirty = true,
    serial = 0,
    raf = 0,
    lastKey = "";
  for (const a of m.animations) {
    const option = document.createElement("option");
    option.value = a.id;
    option.textContent = a.label;
    action.append(option);
  }
  function picture(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not decode " + path));
      img.src = images[path];
    });
    cache.set(path, promise);
    return promise;
  }
  for (const c of m.crew) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.crew = c.id;
    const img = document.createElement("img");
    img.src = images[`portraits/crew-${c.id}.png`];
    img.alt = "";
    const text = document.createElement("span");
    text.textContent = c.name;
    const small = document.createElement("small");
    small.textContent = m.roles[c.role].name;
    text.append(small);
    button.append(img, text);
    button.onclick = () => {
      selected = c.id;
      info();
      elapsed = 0;
      dirty = true;
      schedule();
    };
    $("roster").append(button);
  }
  function info() {
    const c = m.crew.find((c) => c.id === selected);
    $("name").textContent = c.name;
    $("role").textContent = m.roles[c.role].name + " / " + c.trait;
    $("build").textContent = c.heightCm + " cm · " + c.build;
    $("personality").textContent = c.personality;
    $("gesture").textContent = c.signature;
    $("portrait").src = images[`portraits/crew-${c.id}.png`];
    $("portrait").alt = c.name + " portrait";
    document
      .querySelectorAll("[data-crew]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.crew === selected)),
      );
  }
  function updatePause() {
    pause.textContent = paused ? "Play" : "Pause";
    pause.setAttribute("aria-pressed", String(paused));
  }
  function changed() {
    if (action.value.startsWith("eva_")) variant.value = "eva";
    elapsed = 0;
    dirty = true;
    schedule();
  }
  for (const el of [action, variant, direction, resolution])
    el.addEventListener("change", changed);
  pause.onclick = () => {
    paused = !paused;
    last = 0;
    updatePause();
    schedule();
  };
  $("step").onclick = () => {
    paused = true;
    updatePause();
    const a = m.atlases
      .find(
        (a) =>
          a.crew === selected &&
          a.variant === variant.value &&
          a.direction === direction.value,
      )
      .rows.find((r) => r.action === action.value);
    elapsed += 1000 / a.fps + 0.01;
    dirty = true;
    schedule();
  };
  $("restart").onclick = () => {
    elapsed = 0;
    dirty = true;
    schedule();
  };
  document.addEventListener("keydown", (e) => {
    if (
      e.code === "Space" &&
      !["SELECT", "BUTTON"].includes(document.activeElement.tagName)
    ) {
      e.preventDefault();
      pause.click();
    }
  });
  document.addEventListener("visibilitychange", () => {
    last = 0;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else schedule();
  });
  async function render() {
    const low = resolution.value === "gameplay",
      factor = low ? 0.25 : resolution.value === "detail" ? 2 : 1,
      rows = m.crew.map((c) => {
        const a = m.atlases.find(
            (a) =>
              a.crew === c.id &&
              a.variant === variant.value &&
              a.direction === direction.value,
          ),
          r = a.rows.find((r) => r.action === action.value),
          tick = Math.floor((elapsed * r.fps) / 1000),
          f = r.frames[r.loop ? tick % 8 : Math.min(tick, 7)];
        return {
          c,
          a,
          r,
          f,
          index: r.loop ? tick % 8 : Math.min(tick, 7),
          path: low
            ? a.gameplay
            : resolution.value === "detail"
              ? a.detail
              : a.master,
        };
      });
    const key = [
      selected,
      variant.value,
      direction.value,
      resolution.value,
      action.value,
      ...rows.map((r) => r.index),
    ].join("/");
    if (key === lastKey) return;
    lastKey = key;
    const thisSerial = ++serial;
    try {
      const decoded = await Promise.all(rows.map((row) => picture(row.path)));
      if (thisSerial !== serial) return;
      stage.imageSmoothingEnabled = false;
      lineup.imageSmoothingEnabled = false;
      stage.clearRect(0, 0, 256, 384);
      lineup.clearRect(0, 0, 1024, 208);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i],
          f = row.f;
        lineup.drawImage(
          decoded[i],
          f.x * factor,
          f.y * factor,
          64 * factor,
          96 * factor,
          i * 128,
          0,
          128,
          192,
        );
        lineup.fillStyle = row.c.id === selected ? "#e8bf71" : "#98a9b7";
        lineup.font = "12px sans-serif";
        lineup.fillText(row.c.name, i * 128 + 22, 204);
        if (row.c.id === selected) {
          if (action.value === "walk") floor(stage, row);
          context(stage, f, action.value);
          stage.drawImage(
            decoded[i],
            f.x * factor,
            f.y * factor,
            64 * factor,
            96 * factor,
            0,
            0,
            256,
            384,
          );
          $("status").textContent =
            row.c.name +
            " · " +
            row.r.action +
            " · Frame " +
            (row.index + 1) +
            "/8 · " +
            row.r.fps.toFixed(2) +
            " fps" +
            (row.r.loop ? " · Loop" : " · One shot");
        }
      }
    } catch (e) {
      $("status").textContent = e.message;
      paused = true;
      updatePause();
    }
  }
  function floor(ctx, row) {
    const yaw =
        ({ se: 45, sw: 315, ne: 135, nw: 225 }[direction.value] * Math.PI) /
        180,
      tick = Math.floor((elapsed * row.r.fps) / 1000),
      travel = (tick * m.movement.worldUnitsPerWalkCycle) / 8,
      dx = Math.sin(yaw) * travel,
      dy = -Math.cos(yaw) * travel,
      bx = Math.floor(((dx + dy) * Math.SQRT1_2) / 12) * 12,
      by = Math.floor(((dy - dx) * Math.SQRT1_2) / 12) * 12;
    ctx.strokeStyle = "#172438";
    ctx.lineWidth = 1;
    function line(a, b, c, d) {
      ctx.beginPath();
      ctx.moveTo(
        128 + ((a - b) * Math.SQRT1_2 - dx) * 4,
        352 - ((a + b) * Math.SQRT1_2 - dy) * 2,
      );
      ctx.lineTo(
        128 + ((c - d) * Math.SQRT1_2 - dx) * 4,
        352 - ((c + d) * Math.SQRT1_2 - dy) * 2,
      );
      ctx.stroke();
    }
    for (let k = -12; k <= 12; k++) {
      line(bx + k * 12, by - 144, bx + k * 12, by + 144);
      line(bx - 144, by + k * 12, bx + 144, by + k * 12);
    }
  }
  function context(ctx, f, a) {
    if (a === "eva_float") {
      const t = f.anchors.tether;
      ctx.strokeStyle = "#72899e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, t.y * 4 + 35);
      ctx.quadraticCurveTo(t.x * 2, t.y * 4 + 35, t.x * 4, t.y * 4);
      ctx.stroke();
    }
    if (a === "eva_repair") {
      const t = f.anchors.toolTip;
      if (t) {
        const h = f.anchors.handL,
          l = Math.min(t.x, h.x) - 4,
          top = Math.min(t.y, h.y) - 5,
          w = Math.max(t.x, h.x) - l + 4,
          height = Math.max(t.y, h.y) - top + 5;
        ctx.fillStyle = "#20314a";
        ctx.fillRect(l * 4, top * 4, w * 4, height * 4);
        ctx.strokeStyle = "#72899e";
        ctx.strokeRect(l * 4, top * 4, w * 4, height * 4);
        ctx.fillStyle = "#c99d55";
        ctx.fillRect(t.x * 4 - 2, t.y * 4 - 2, 4, 4);
      }
    }
  }
  function schedule() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    if (last && !paused && !document.hidden) {
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
  updatePause();
  schedule();
})();

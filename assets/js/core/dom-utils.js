/**
 * Vanilla DOM helpers replacing jQuery for the Cultura prototype.
 * DomCollection mirrors the subset of jQuery used in the legacy app.js.
 */

/** @param {ParentNode|Document} [root] */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/** @param {ParentNode|Document} [root] */
export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function on(el, type, handler, options) {
  if (!el) return;
  if (Array.isArray(el)) {
    el.forEach((node) => node.addEventListener(type, handler, options));
    return;
  }
  el.addEventListener(type, handler, options);
}

export function delegate(root, type, selector, handler) {
  on(root, type, (e) => {
    const target = e.target instanceof Element ? e.target.closest(selector) : null;
    if (target && root.contains(target)) handler.call(target, e, target);
  });
}

export function toggleClass(el, className, force) {
  if (!el) return;
  const nodes = el instanceof DomCollection ? el.items : Array.isArray(el) ? el : [el];
  const classes = String(className).trim().split(/\s+/).filter(Boolean);
  nodes.forEach((node) => {
    if (!(node instanceof Element)) return;
    classes.forEach((cls) => {
      if (force === undefined) node.classList.toggle(cls);
      else node.classList.toggle(cls, force);
    });
  });
}

export function setAttr(el, name, value) {
  if (!el) return;
  const nodes = el instanceof DomCollection ? el.items : [el];
  nodes.forEach((node) => {
    if (!(node instanceof Element)) return;
    if (value === undefined || value === null) node.removeAttribute(name);
    else node.setAttribute(name, String(value));
  });
}

export function getVal(el) {
  if (!el) return "";
  const node = el instanceof DomCollection ? el.items[0] : el;
  if (!node) return "";
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) {
    return node.value;
  }
  return "";
}

export function setVal(el, value) {
  const node = el instanceof DomCollection ? el.items[0] : el;
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) {
    node.value = value ?? "";
    node.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

export function setProp(el, name, value) {
  const nodes = el instanceof DomCollection ? el.items : Array.isArray(el) ? el : [el];
  nodes.forEach((node) => {
    if (!(node instanceof Element)) return;
    if (name === "disabled") node.toggleAttribute("disabled", !!value);
    else if (name === "hidden") node.hidden = !!value;
    else if (name === "checked" && node instanceof HTMLInputElement) node.checked = !!value;
    else if (name === "open" && node instanceof HTMLDetailsElement) node.open = !!value;
    else node[name] = value;
  });
}

export function getProp(el, name) {
  const node = el instanceof DomCollection ? el.items[0] : el;
  if (!node) return undefined;
  if (name === "disabled") return node.hasAttribute("disabled");
  if (name === "hidden") return node.hidden;
  if (name === "checked" && node instanceof HTMLInputElement) return node.checked;
  if (name === "open" && node instanceof HTMLDetailsElement) return node.open;
  return node[name];
}

export function fetchJson(url) {
  return asJQueryPromise(
    fetch(url).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
  );
}

/** Adds jQuery-style `.fail()` and chainable `.then()` for migrated code. */
export function asJQueryPromise(promise) {
  promise.fail = function (fn) {
    promise.catch(fn);
    return promise;
  };
  const originalThen = promise.then.bind(promise);
  promise.then = function (onFulfilled, onRejected) {
    return asJQueryPromise(originalThen(onFulfilled, onRejected));
  };
  return promise;
}

export function extend(target, ...sources) {
  return Object.assign(target, ...sources);
}

const elementData = new WeakMap();

function getElementData(el) {
  if (!elementData.has(el)) elementData.set(el, {});
  return elementData.get(el);
}

export function data(el, key, value) {
  const node = el instanceof DomCollection ? el.items[0] : el;
  if (!(node instanceof Element)) return undefined;
  const store = getElementData(node);
  if (value !== undefined) {
    store[key] = value;
    return el instanceof DomCollection ? el : store[key];
  }
  return store[key];
}

export function ready(fn) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
  else fn();
}

export class DomCollection {
  /** @param {Element[]} items */
  constructor(items) {
    this.items = items.filter(Boolean);
    this.length = this.items.length;
  }

  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }

  get(index) {
    if (typeof index === "number") return this.items[index];
    return this.items[index];
  }

  /** jQuery-style numeric index access: $(sel)[0] */
  item(index) {
    return this.items[index];
  }

  clone() {
    return new DomCollection(this.items.map((el) => el.cloneNode(true)));
  }

  first() {
    return new DomCollection(this.items.slice(0, 1));
  }

  eq(index) {
    const el = this.items[index];
    return new DomCollection(el ? [el] : []);
  }

  find(selector) {
    const found = [];
    this.items.forEach((root) => {
      if (root instanceof Element) found.push(...root.querySelectorAll(selector));
    });
    return new DomCollection(found);
  }

  closest(selector) {
    for (const el of this.items) {
      const match = el instanceof Element ? el.closest(selector) : null;
      if (match) return new DomCollection([match]);
    }
    return new DomCollection([]);
  }

  filter(selectorOrFn) {
    if (typeof selectorOrFn === "function") {
      return new DomCollection(this.items.filter((el, i) => selectorOrFn.call(el, i, el)));
    }
    return new DomCollection(this.items.filter((el) => el.matches(selectorOrFn)));
  }

  each(fn) {
    this.items.forEach((el, i) => fn.call(el, i, el));
    return this;
  }

  toggleClass(className, force) {
    toggleClass(this, className, force);
    return this;
  }

  addClass(className) {
    const classes = String(className).trim().split(/\s+/).filter(Boolean);
    this.items.forEach((el) => classes.forEach((cls) => el.classList.add(cls)));
    return this;
  }

  removeClass(className) {
    const classes = String(className).trim().split(/\s+/).filter(Boolean);
    this.items.forEach((el) => classes.forEach((cls) => el.classList.remove(cls)));
    return this;
  }

  hasClass(className) {
    return this.items.some((el) => el.classList.contains(className));
  }

  attr(name, value) {
    if (value !== undefined) {
      setAttr(this, name, value);
      return this;
    }
    const el = this.items[0];
    return el?.getAttribute(name) ?? undefined;
  }

  removeAttr(name) {
    this.items.forEach((el) => el.removeAttribute(name));
    return this;
  }

  prop(name, value) {
    if (value !== undefined) {
      setProp(this, name, value);
      return this;
    }
    return getProp(this.items[0], name);
  }

  val(value) {
    if (value !== undefined) {
      setVal(this.items[0], value);
      return this;
    }
    return getVal(this.items[0]);
  }

  html(value) {
    if (value !== undefined) {
      this.items.forEach((el) => {
        el.innerHTML = value;
      });
      return this;
    }
    return this.items[0]?.innerHTML ?? "";
  }

  text(value) {
    if (value !== undefined) {
      this.items.forEach((el) => {
        el.textContent = value;
      });
      return this;
    }
    return this.items[0]?.textContent ?? "";
  }

  append(content) {
    this.items.forEach((el) => {
      if (typeof content === "string") el.insertAdjacentHTML("beforeend", content);
      else if (content instanceof DomCollection) content.items.forEach((c) => el.appendChild(c));
      else if (content instanceof Element) el.appendChild(content);
    });
    return this;
  }

  prepend(content) {
    this.items.forEach((el) => {
      if (typeof content === "string") el.insertAdjacentHTML("afterbegin", content);
      else if (content instanceof DomCollection) {
        content.items.slice().reverse().forEach((c) => el.insertBefore(c, el.firstChild));
      } else if (content instanceof Element) el.insertBefore(content, el.firstChild);
    });
    return this;
  }

  empty() {
    this.items.forEach((el) => {
      el.innerHTML = "";
    });
    return this;
  }

  remove() {
    this.items.forEach((el) => el.remove());
    return this;
  }

  children() {
    const kids = [];
    this.items.forEach((el) => kids.push(...el.children));
    return new DomCollection(kids);
  }

  parent() {
    const parents = this.items.map((el) => el.parentElement).filter(Boolean);
    return wrapCollection(new DomCollection(parents));
  }

  wrap(html) {
    this.items.forEach((el) => {
      if (!(el instanceof Element) || !el.parentNode) return;
      const wrapped = $(html);
      const wrapper = wrapped.items[0];
      if (!wrapper) return;
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    });
    return this;
  }

  css(name, value) {
    if (name && typeof name === "object") {
      this.items.forEach((el) => {
        Object.assign(el.style, name);
      });
      return this;
    }
    if (value !== undefined) {
      this.items.forEach((el) => {
        el.style[name] = value;
      });
      return this;
    }
    const el = this.items[0];
    if (!el) return undefined;
    return window.getComputedStyle(el).getPropertyValue(name);
  }

  is(selector) {
    if (selector === ":checked") {
      return this.items.some((el) => el instanceof HTMLInputElement && el.checked);
    }
    if (selector === ":disabled") {
      return this.items.some((el) => el.hasAttribute("disabled"));
    }
    return this.items.some((el) => el.matches(selector));
  }

  on(type, selectorOrHandler, maybeHandler) {
    if (typeof selectorOrHandler === "function") {
      this.items.forEach((el) => on(el, type, selectorOrHandler));
    } else {
      this.items.forEach((el) => delegate(el, type, selectorOrHandler, maybeHandler));
    }
    return this;
  }

  off(type, handler) {
    this.items.forEach((el) => el.removeEventListener(type, handler));
    return this;
  }

  trigger(type) {
    this.items.forEach((el) => {
      if (type === "focus") el.focus();
      else if (type === "click") el.click();
      else el.dispatchEvent(new Event(type, { bubbles: true }));
    });
    return this;
  }

  data(key, value) {
    if (value !== undefined) {
      this.items.forEach((el) => data(el, key, value));
      return this;
    }
    return data(this.items[0], key);
  }

  show() {
    this.items.forEach((el) => {
      el.classList.remove("d-none");
      el.hidden = false;
    });
    return this;
  }

  hide() {
    this.items.forEach((el) => {
      el.classList.add("d-none");
    });
    return this;
  }
}

function wrapCollection(col) {
  return new Proxy(col, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && /^\d+$/.test(prop)) {
        return target.items[Number(prop)];
      }
      const val = Reflect.get(target, prop, receiver);
      return typeof val === "function" ? val.bind(target) : val;
    },
  });
}

/**
 * jQuery-compatible selector entry point for migrated code.
 * @param {string|Element|Document|Window|DomCollection} input
 */
export function $(input) {
  if (input instanceof DomCollection) return wrapCollection(input);
  if (input instanceof Element) return wrapCollection(new DomCollection([input]));
  if (input === document || input === window) {
    return wrapCollection(new DomCollection([document.documentElement]));
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("<")) {
      const tpl = document.createElement("template");
      tpl.innerHTML = trimmed;
      return wrapCollection(
        new DomCollection(Array.from(tpl.content.childNodes).filter((n) => n instanceof Element))
      );
    }
    if (trimmed.startsWith("#") && !trimmed.includes(" ")) {
      const el = document.getElementById(trimmed.slice(1));
      return wrapCollection(new DomCollection(el ? [el] : []));
    }
    return wrapCollection(new DomCollection(qsa(trimmed)));
  }
  return wrapCollection(new DomCollection([]));
}

/** @param {() => void} fn */
export function domReady(fn) {
  ready(fn);
}

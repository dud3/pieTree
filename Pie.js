
(() => {
  function obj(o) {
    this.o = o || {};
  }
  obj.prototype.get = function(that) {
    return this.o;
  }
  obj.prototype.merge = function(v) {
    v = v || {};
    for(var k in v) if(this.o[k] !== undefined) this.o[k] = v[k];

    return this;
  }
  obj.prototype.bind = function(that) {
    for(var k in this.o) that[k] = this.o[k];

    return this;
  }
  obj.prototype.log = function() {
    let argv = []
    for (var k in this.o) argv.push([k, this.o[k]])

    console.warn('argv <---')
    argv.map(a => { console.log(a) })
    console.warn('---> argv')
  }

  function El(argv) {
    this.argv = (new obj({
      type: "html", // svg
      name: "div",
      text: "element",
      attrs: {}, /* k,v */
      events: {
        mousedown: () => {},
        mouseup: () => {},
        click: () => {}
      }
    })).merge(argv).bind(this).get()

    var that = this

    function createEl(e) {
      if (that.type == "html") return document.createElement(e)

      if (that.type == "svg") return document.createElementNS('http://www.w3.org/2000/svg', e)
    }
    function createAttr(e) {
      if (that.type == "html") return document.createAttribute(e)

      if (that.type == "svg") return document.createAttributeNS(null, e)
    }

    function setAttr(e) {
      if (that.type == "html") return document.setAttributeNode(e)

      if (that.type == "svg") return document.setAttributeNS(null, e)
    }

    this.node = createEl(this.name)

    for(const key in this.attrs) {
      this.node.setAttribute(key, this.attrs[key])
    }

    // this.node.innerText = this.text

    this.node.innerHTML = this.text

    for(const key in this.events) {
      this.node.addEventListener(key, (e) => { this.events[key](e) })
    }

    return this
  }

  // node[]
  El.prototype.append = function (els = []) {
    els.map(e => { this.node.appendChild(e.node) })

    return this
  }

  El.prototype.clone = function (argv) {
    // check if El instance
    return new El((new obj(this.argv)).merge(argv).get())
  }

  El.prototype.get = function () {
    return this.node
  }

  // Pie menu

  const upoints = (n = 2, r = 2, t = 0) => {
    const split = 1/n
    const xys = []

    let j = 0
    for (let i = 0; i < 2; i += split) {
      xys.push({
        x: t + ((j % 2 == 1 ? r/1.5 : r) * Math.cos(i * Math.PI)),
        y: t + ((j % 2 == 1 ? r/1.5 : r) * Math.sin(i * Math.PI))
      })
      j++
    }
    return xys
  }

  function path(argv) {
    (new obj({
      t: 0,  x0: 0, y0: 0, x1: 0, y1: 0, rx: 0, ry: 0, id: '',
      events: {
        mousedown: () => {}
      }
    })).merge(argv).bind(this)

    const id = this.id, events = this.events, parent = this.id.slice(0, -1)

    return new El({
      type: "svg",
      name: "path",
      attrs: {
        id: `path-${this.id}`,
        style: "cursor: pointer",
        d: `M ${this.t} ${this.t} L ${this.x1} ${this.y1} A ${this.rx} ${this.ry} 0 0 0 ${this.x0} ${this.y0}`,
        stroke: "#000",
        fill: "#ccc",
        "stoke-width": 2
      },
      events: {
        mousedown: (e) => {
          var e = document.getElementById(`pie-${id}`)
          if (e) {
            e.style.display = 'block';
            document.getElementById(`pie-${parent}`).style.display = 'none'
          }

          events.mousedown(e)
        }
      }
    })
  }

  function text(argv) {
    (new obj({
      x: 0,
      y: 0,
      t: 0,
      id: '',
      color: '#000',
      events: {
        mousedown: () => {}
      }
    })).merge(argv).bind(this)

    return new El({
      type: "svg",
      name: "text",
      text: this.t,
      attrs: {
        x: this.x,
        y: this.y,
        id: `text-${this.id}`,
        style: `cursor: pointer; fill: ${this.color}`,
        "dominant-baseline": "middle",
        "text-anchor": "middle"
      },
      events: this.events
    })
  }

  const circle = (x, y, r = 20, id = '') =>
    new El({
      type: "svg",
      name: "circle",
      attrs: {
        cx: x,
        cy: y,
        r: r,
        stroke: "#000",
        fill: "#fff",
        id: `circle-${id}`,
        style: "cursor: pointer"
      },
      events: {
        mousedown: () => {
          document.getElementById(`pie-${id}`).outerHTML = ''
        }
      }
    })

  function Pie(argv) {
    (new obj({
       w: 310, n: 2, r: 2, t: 0, f: false, nodes: [], parentid: 0, display: 'block'
    })).merge(argv).bind(this)

    const svg = new El({
      type: "svg",
      name: "svg",
      attrs: {
        id: `pie-${this.parentid}`,
        style: `display: ${this.display}`,
        width: "300",
        height: "300",
        xmlns: "http://www.w3.org/2000/svg"
      }
    })

    const points = upoints(this.n, this.r, this.t)
    const cpoints = points.filter((p, i) => i % 2 == 0)
    const tpoints = points.filter((p, i) => i % 2 == 1)

    const els = []

    for (let i = 0; i < cpoints.length - 1; i++) {
      let p0 = cpoints[i]
      let p1 = cpoints[i + 1]
      const rx = this.f ? 0 : 1, ry = 1;
      const id = this.parentid + '' + i

      els.push(
        path({
          t: this.t, x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y, rx: rx, ry: ry, id: id,
          events: {
            mousedown: this.nodes[i].onclick
          }
        })
      )
      els.push(
        text({
          x: tpoints[i].x,
          y: tpoints[i].y,
          t: this.nodes[i].name,
          id: id,
          events: {
            mousedown: this.nodes[i].onclick
          }
        })
      )

      if(i + 1 === cpoints.length - 1) {
        p0 = cpoints[i + 1]
        p1 = cpoints[0]
        const id = this.parentid + '' + (i + 1)

        els.push(
          path({
            t: this.t, x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y, rx: rx, ry: ry, id: id,
            events: {
              mousedown: this.nodes[i + 1].onclick
            }
          })
        )

        if (tpoints[i + 1]) {
          els.push(
            text({
              x: tpoints[i + 1].x,
              y: tpoints[i + 1].y,
              t: this.nodes[i + 1].name,
              id: id,
              events: {
                mousedown: this.nodes[i + 1].onclick
              }
            })
          )
        }
      }
    }

    els.push(circle(this.w/2, this.t, 22, this.parentid))
    els.push(text(this.w/2, this.t, 'x', 'close', "#000", () => { svg.node.outerHTML = '' } ))

    svg.append(els)

    return svg
  }

  function pies(nodes = []) {
    const pies = []
    function svg(nodes = [], parentid = 0, display = 'block') {
      let w = 220, t = w/2, n = nodes.length

      pies.push(
        new Pie({ w: w, n: n, r: t/1.4, t: t, f: false, nodes: nodes, parentid: parentid, display: display })
      )

      nodes.map((node, i) => {
        const parent = parentid + '' + i
        if (node.children.length > 0) { svg(node.children, parent, 'none') }
    })
    }

    svg(nodes)

    return pies
  }

  // public

  window.Pie = {
    El: El,
    Pie: Pie,
    pies: pies
  }
})()

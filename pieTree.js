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

const a = El({
  name: "a",
  attrs: {
    href: "google.com"
  },
  events: {
    mousedown: (e) => { console.warn(e) }
  }
})
  
let div = document.getElementById('id')

// console.log(a, div)

// div.appendChild(a);

let svg = new El({
  type: "svg",
  name: "svg",
  attrs: {
    id: "svg", 
    width: "300", 
    height: "300",
    xmlns: "http://www.w3.org/2000/svg"
  }
})

var c = new El({
  type: "svg",
  name: "circle",
  attrs: {
    cx: 50,
    cy: 50,
    r: 50
  },
  events: {
    mousedown: (e) => { console.log(e) }
  }
})

var c1 = new El({
  type: "svg",
  name: "circle",
  attrs: {
    cx: 150,
    cy: 150,
    r: 150,
    fill: "red"
  },
  events: {
    mousedown: () => {},
    mouseout: (e) => { console.log("mouse out") },
    mouseup: (e) => { console.log("mouse up") }
  }
})

var c2 = c1.clone({attrs: { cx: 200, cy: 200, r: 32, fill: "#fff", stroke: "#000" }})

console.log("c2", c2)

console.log(svg.node)

svg.append([c, c1, c2])

console.log(svg.node)

div.appendChild(svg.node)

// Pie menu

function upoints(n = 2, r = 2, t = 0) {
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


const path = (t, x0, y0, x1, y1, rx, ry, id) => { 
  const parent = id.slice(0, -1)
  
  return new El({
    type: "svg",
    name: "path",
      attrs: {
        id: `path-${id}`,
        style: "cursor: pointer",
        d: `M ${t} ${t} L ${x1} ${y1} A ${rx} ${ry} 0 0 0 ${x0} ${y0}`,
        stroke: "#000",
        fill: "#ccc",
        "stoke-width": 2
    },
    events: {
       mousedown: () => {
        console.warn("path: mousedown") 
        
         var e = document.getElementById(`pie-${id}`) 
         if (e) { 
           e.style.display = 'block'; 
           document.getElementById(`pie-${parent}`).style.display = 'none' 
         }
       },
      mouseout: (e) => { console.log("mouse out") },
      mouseup: (e) => { console.log("mouse up") }
    }
  })
}

const text = (x, y, t, id, color= "#000", mousedown = () => {}) => 
  new El({
    type: "svg",
    name: "text",
    text: t,
    attrs: {
      x: x,
      y: y,
      id: `text-${id}`,
      style: `cursor: pointer; fill: ${color}`,
      "dominant-baseline": "middle",
      "text-anchor": "middle"
    },
    events: {
      mousedown: mousedown
    }
  })

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

function pie(argv) {
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
          
    els.push(path(this.t, p0.x, p0.y, p1.x, p1.y, rx, ry, id))
    els.push(text(tpoints[i].x, tpoints[i].y, this.nodes[i].name, id))
          
    if(i + 1 === cpoints.length - 1) {
      p0 = cpoints[i + 1]
      p1 = cpoints[0]
      const id = this.parentid + '' + (i + 1)
      
      els.push(path(this.t, p0.x, p0.y, p1.x, p1.y, rx, ry, id))
      
      if (tpoints[i + 1]) {
        els.push(text(tpoints[i + 1].x, tpoints[i + 1].y, this.nodes[i + 1].name, id))
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
      new pie({ w: w, n: n, r: t/1.4, t: t, f: false, nodes: nodes, parentid: parentid, display: display })
    )
    
    nodes.map((node, i) => {
      const parent = parentid + '' + i
      if (node.children.length > 0) { svg(node.children, parent, 'none') }
    })
  }
  
  svg(nodes)
  
  return pies
}

// ...

const nodes = [{
  name: 'x',
  onclick: () => {
    console.warn('x')
  },
  children: []
},{
  name: 'y',
  onclick: () => {
    alert('y')
  },
  children: []
},{
  name: 'z',
  onclick: () => {
  },
  children: [{
    name: 'w',
    onclick: () => {
    },
    children: []
  },{
    name: 'a',
    onclick: () => {
    },
    children: []
  }]
},{
  name: 'w',
  onclick: () => {
  },
  children: []
},{
  name: 'a',
  onclick: () => {
  },
  children: []
},{
  name: 'a',
  onclick: () => {
  },
  children: []
},{
  name: 'a',
  onclick: () => {
  },
  children: []
}]

console.log(nodes)

let w = 220, t = w/2, n = nodes.length
const thePie = new pie({ w: w, n: n, r: t/1.4, t: t, f: false, nodes: nodes, parentid: '0'})
    
// div.appendChild(thePie.node)

const pieTree = pies(nodes);

console.log("pieTree", pieTree)

pieTree.map(pie => {
  div.appendChild(pie.node)
})

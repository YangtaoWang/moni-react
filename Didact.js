
// {div, {} }

const Didact = {
  createElement,
  render
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'object' ? child : createTextElement(child)
      })
    }
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createDom (fiber) {
  let dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)
  let isProperty = key => key !== 'children'
  Object.keys(fiber.props)
  .filter(isProperty)
  .forEach((name) => {
    dom[name] = fiber.props[name]
  })
  return dom
}
const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {

  // remove old or changed event listeners
  Object.keys(prevProps)
  .filter(isEvent)
  .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
  .forEach(name => {
    const eventType = name.toLowerCase().substring(2)
    dom.removeEventListener(eventType, prevProps[name])
  })

  // remove old properties
  Object.keys(prevProps)
  .filter(isProperty)
  .filter(isGone(prevProps, nextProps))
  .forEach(name => {
    dom[name] = ''
  })

  // Set new or changed properties
  Object.keys(nextProps)
  .filter(isProperty)
  .filter(isNew(prevProps, nextProps))
  .filter(name => {
    dom[name] = nextProps[name]
  })

  // Add event Listener
  Object.keys(nextProps)
  .filter(isEvent)
  .filter(isNew(prevProps, nextProps))
  .forEach(name => {
    const eventType = name.toLowerCase.substring(2)
    dom.addEventListener(eventType, nextProps[name])
  })

}



function render (element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }
  deletions = []
  nextUnitOfWork = wipRoot
  // let dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)
  // let isProperty = key => key !== 'children'
  // Object.keys(element.props)
  // .filter(isProperty)
  // .forEach((name) => {
  //   dom[name] = element.props[name]
  // })
  // element.props.children.forEach((child) => {
  //   render(child, dom)
  // })
  // container.appendChild(dom)
}


// fiber相关
let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  // console.log(wipRoot)
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {

  // add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  // ceate new Fiber
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
  // let index = 0
  // let prevSibling = null
  // while (index < elements.length) {
  //   const element = elements[index]
  //   const newFiber = {
  //     type: element.type,
  //     props: element.props,
  //     parent: fiber,
  //     dom: null
  //   }
  //   if (index === 0) {
  //     fiber.child = newFiber
  //   } else {
  //     prevSibling.sibling = newFiber
  //   }
  //   prevSibling = newFiber
  //   index++
  // }

  // return next unit of work
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

// reconcileChildren
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber= wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null
  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    const sameType = oldFiber && element && element.type == oldFiber.type
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}

// committ to the DOM
function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork (fiber) {
  if (!fiber) return
  const domParent = fiber.parent.dom
  // domParent.appendChild(fiber.dom)
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}



const element = Didact.createElement('div', { id: 'foo' }, Didact.createElement('p', null, 'bar'), Didact.createElement('b'))
console.log(element)
const container = document.getElementById('root')
Didact.render(element, container)

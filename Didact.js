
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

function render (element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  }
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
  let index = 0
  let prevSibling = null
  while (index < elements.length) {
    const element = elements[index]
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }

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

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork (fiber) {
  if (!fiber) return
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}



const element = Didact.createElement('div', { id: 'foo' }, Didact.createElement('p', null, 'bar'), Didact.createElement('b'))
console.log(element)
const container = document.getElementById('root')
Didact.render(element, container)

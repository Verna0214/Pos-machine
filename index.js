const apiUrl = 'https://ac-w3-dom-pos.firebaseio.com/products.json'
const menu = document.querySelector('#menu')
const cart = document.querySelector('#cart')
const sum = document.querySelector('#sum')
const checkOut = document.querySelector('#check-out')
const productData = []
const cartData = []
let total = 0


// axios
axios
  .get(apiUrl)
  .then((res) => {
    productData.push(...res.data)
    renderMenuDisplay(productData)
  })
  .catch(err => console.log(err))


// render menu function
function renderMenuDisplay (data) {
  let rawHTML = ``
  data.forEach((product) => {
    rawHTML += `
      <div class="col-3">
        <div class="card">
          <img src="${product.imgUrl}" class="card-img-top" alt="img" data-id="${product.id}">
          <div class="card-body" data-id="${product.id}">
            <h5 class="card-title" data-id="${product.id}" style="font-weight: 600;">${product.name}</h5>
            <p class="card-text" data-id="${product.id}">$${product.price}</p>
            <button type="button" class="btn btn-primary" data-id="${product.id}">加入購物車</button>
          </div>
        </div>
      </div>
    `
  })
  menu.innerHTML = rawHTML
}

// render cart function
function renderCartDisplay (data) {
  cart.innerHTML = data.map(product => `
    <li class="list-group-item d-flex" style="height: 60px;">
      <p class="mt-2 me-auto fw-medium"">${product.name} X ${product.quantity}，小計：${product.price * product.quantity}</p>
      <button id="plus" type="button" class="btn btn-outline-primary me-4" data-id="${product.id}">＋</button>
      <button id="minus" type="button" class="btn btn-danger" data-id="${product.id}">－</button>
    </li>
  `).join('')
}

// add product to cart
function addToCart (event) {
  const id = event.target.dataset.id
  if (!id) return // 防呆機制，避免使用者點到空白處

  // 在productData裡撈出使用者點選到的物件（使用id比對）
  const targetProduct = productData.find(product => product.id === id)
  const name = targetProduct.name  // 取出物件的name
  const price = targetProduct.price  // 取出物件的price

  // 再將資料放進去cartData前，要先比對有沒有已經存在的資料
  // 一樣用find方式去撈，這次母體資料改成cartData
  const repeatProduct = cartData.find(product => product.id === id)
  if (repeatProduct) {   // 如果撈出有重複的資料
    repeatProduct.quantity += 1  // 將cartData裡的重複資料數量 +1
  } else {
    cartData.push({  // 就將該資料已物件的型態推進cartData裡
      id,
      name,
      price,
      quantity: 1,  // 因為商品沒有重複，所以數量是 1
    })
  }
  // 將加入購物車的資料金額加總丟進total變數
  // 呼叫函式操作總金額計算
  total += price
  calculateSum(total)
  renderCartDisplay(cartData) // 重新渲染cart的畫面
}

// revise product in cart
function reviseCart (event) {
  const target = event.target
  const id = target.dataset.id // 取出按鈕的那筆資料
  const index = cartData.findIndex(item => item.id === id) // 找出該筆資料在cartData的index，做為刪除用
  const item = cartData.find(item => item.id === id)  // 從cartData撈該筆資料去做修改
  if (target.matches('#plus')) {
    item.quantity += 1 // 數量+1
    total += item.price // 總金額 +商品價
  } else if (target.matches('#minus')) {
    item.quantity -= 1
    total -= item.price
    if (item.quantity < 1) {
      cartData.splice(index, 1) // 若數量是 0的話，直接刪除該筆資料
    }
  }
  
  calculateSum(total)
  renderCartDisplay(cartData) // 重新渲染cart的畫面
}

// calculate sum function
function calculateSum (total) {
  if (total === 0) {
    sum.textContent = '--'
  } else {
    sum.textContent = total
  }
}

// submit cart list function
function submit (data) {
  const detail = document.querySelector('#list-detail')
  let message = ``

  if (!data.length) {
    message += `<p>購物車尚未添加任何商品，請再次確認！</p>`
  } else {
    message += `
      <p>以下為本次選購的商品之數量及金額，請再次確認！</p>
      <ul>
    `
    data.forEach((item) => {
      message += `
        <li class="model-list">${item.name} ： ${item.quantity} 份 </li>
      `
    })
    message += `
      </ul>
      <p>總金額：${total} 元</p>
    `
  }

  detail.innerHTML = message
}

// reset cart list function
function reset () {
  while (cartData.length) {
    cartData.pop()
  }
  total = 0
  calculateSum(total)
  renderCartDisplay(cartData)
}

// menu event listener
menu.addEventListener('click', addToCart)
// cart event listener
cart.addEventListener('click', reviseCart)
// checkOut event listener
checkOut.addEventListener('click', (event) => {
  const target = event.target

  if (target.matches('#submit')) {
    submit(cartData)
  } else if (target.matches('#delete')) {
    reset()
  }
})

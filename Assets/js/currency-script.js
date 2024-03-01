const WEB_URL = 'https://v6.exchangerate-api.com/v6/bb9260a6e1aebe6a8c8bad96/latest/'
const WEB_API_KEY = 'bb9260a6e1aebe6a8c8bad96';

let dropList = document.querySelectorAll("form select");
let fromCurrency = document.querySelector(".from select");
let toCurrency = document.querySelector(".to select");
let icon = document.querySelector(".icon");
let exchangeTxt = document.querySelector(".exchange_rate");
let getBtn = document.querySelector("button");


for (let i = 0; i < dropList.length; i++) {
  for (let currency_code in countries_list) {
    let selected =
      i == 0
        ? currency_code == "USD"
          ? "selected"
          : ""
        : currency_code == "GBP"
        ? "selected"
        : "";

    let optionTag = `<option value="${currency_code}" ${selected}>
    ${currency_code}</option>`;

    dropList[i].insertAdjacentHTML("beforeend", optionTag);
  }

  dropList[i].addEventListener("change", (e) => {
    loadFlag(e.target);
  });
}

function loadFlag(element) {
  for (let code in countries_list) {
    if (code == element.value) {
      let imgTag = element.parentElement.querySelector("img");
      imgTag.src = `https://flagcdn.com/48x36/${countries_list[
        code
      ].toLowerCase()}.png`;
    }
  }
}

getBtn.addEventListener("click", (e) => {
  e.preventDefault();
  getExchangeValue();
});

function getExchangeValue() {
  const amount = document.querySelector("form input");
  let amountVal = amount.value;
  if (amountVal == "" || amountVal == "0") {
    amount.value = "1";
    amountVal = 1;
  }

  exchangeTxt.innerText = "Getting exchange rate...";
  let url = `${WEB_URL}${fromCurrency.value}`;
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      let exchangeRate = result.conversion_rates[toCurrency.value];
      let total = (amountVal * exchangeRate).toFixed(2);
      exchangeTxt.innerText = `${amountVal} ${fromCurrency.value} = ${total} ${toCurrency.value}`;
    })
    .catch(() => {
      exchangeTxt.innerText = "something went wrong";
    });
}

window.addEventListener("load", () => {
  getExchangeValue();
});

icon.addEventListener("click", () => {
  let tempCode = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = tempCode;
  loadFlag(fromCurrency);
  loadFlag(toCurrency);
  getExchangeValue();
});
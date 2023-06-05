const regForm = document.getElementById("regForm")
const networkSelectBox = document.getElementById("network")
const voucherSelectBox = document.getElementById("voucher")
const submitBtn = document.getElementById("submitBtn")


document.getElementById("regForm").addEventListener("submit", (e) => {
    e.preventDefault();
    // console.log(localStorage);
    // window.location = '/test?amount=5.00&item_name=cellc5';
    window.location = `/server-payfast-form?amount=${localStorage.getItem("sellprice")}&item_name=${localStorage.getItem("voucher")}&cell_number=${localStorage.getItem("phonenumber")}&network=${localStorage.getItem("network")}`
})

network.addEventListener("change", (e) => {
    e.preventDefault()
    removeAllSelectBoxOptions(voucherSelectBox)
    const network = networkSelectBox.value
    // console.log(network);

    if (network.length > 0) {
        createVoucherOptions(network)
    }

})

async function createVoucherOptions(network) {

    const response = await fetch("/freepaid/allProducts");
    const res_data = await response.json();
    // console.log(res_data);

    let filteredData = res_data.filter((item) => {
        return item.network === network;
    });

    filteredData.forEach(item => {

        const newOption = document.createElement('option');
        const optionText = document.createTextNode(`${item.description} - R${item.sellprice}`);
        newOption.appendChild(optionText);
        newOption.setAttribute('name', item.network);
        newOption.setAttribute('value', item.sellprice);
        voucherSelectBox.appendChild(newOption);
    })

}

function removeAllSelectBoxOptions(selectBox) {
    while (selectBox.options.length > 0) {
        voucherSelectBox.remove(0);
    }
}



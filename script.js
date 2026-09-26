

"use strict";


const CART_KEY = "beanBoutiqueCart";

let cart = [];

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");

const emptyCart = document.getElementById("empty-cart");
const cartContent = document.getElementById("cart-content");

const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("shipping");
const grandTotalElement = document.getElementById("grand-total");



function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_KEY);

        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);

            if (Array.isArray(parsedCart)) {
                cart = parsedCart;
            }
        }
    } catch (error) {
        console.error("Could not load cart:", error);
        cart = [];
    }
}



function saveCart() {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}



function openMenu() {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.add("active");

    menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Close navigation menu"
    );
}


function closeMenu() {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.remove("active");

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
    );
}


function toggleMenu() {
    if (!mainNav) return;

    const isOpen =
        mainNav.classList.contains("active");

    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}



if (menuToggle) {
    menuToggle.addEventListener(
        "click",
        toggleMenu
    );
}



if (mainNav) {
    mainNav.addEventListener(
        "click",
        function (event) {

            const link = event.target.closest(
                ".nav-link"
            );

            if (link) {
                closeMenu();
            }
        }
    );
}



document.addEventListener(
    "click",
    function (event) {

        if (!mainNav || !menuToggle) return;

        const clickedInsideMenu =
            mainNav.contains(event.target);

        const clickedToggle =
            menuToggle.contains(event.target);

        if (
            !clickedInsideMenu &&
            !clickedToggle
        ) {
            closeMenu();
        }
    }
);



document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {
            closeMenu();
        }
    }
);



function showPage(pageId) {

    const sections = document.querySelectorAll(
        ".page-section"
    );

    sections.forEach(function (section) {

        section.classList.remove("active");

    });

    const targetPage =
        document.getElementById(pageId);

    if (targetPage) {
        targetPage.classList.add("active");
    }

    const navLinks = document.querySelectorAll(
        ".nav-link"
    );

    navLinks.forEach(function (link) {

        link.classList.remove("nav-active");

        if (
            link.dataset.page === pageId
        ) {
            link.classList.add("nav-active");
        }
    });

    closeMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}



document.addEventListener(
    "click",
    function (event) {

        const link = event.target.closest(
            ".nav-link, .footer-nav-link"
        );

        if (!link) return;

        const pageId = link.dataset.page;

        if (!pageId) return;

        event.preventDefault();

        showPage(pageId);
    }
);



function addToCart(name, price, image) {

    const productPrice = Number(price);

    if (
        !name ||
        !Number.isFinite(productPrice) ||
        productPrice <= 0
    ) {
        alert("Product information is invalid.");
        return;
    }

    const existingProduct = cart.find(
        function (item) {
            return item.name === name;
        }
    );

    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            name: name,
            price: productPrice,
            image: image || "",
            quantity: 1
        });

    }

    saveCart();

    renderCart();

    showCartMessage(name);
}



document.addEventListener(
    "click",
    function (event) {

        const button = event.target.closest(
            ".add-cart-btn, [data-add-cart]"
        );

        if (!button) return;

        event.preventDefault();

        const name =
            button.dataset.name ||
            button.dataset.productName;

        const price =
            button.dataset.price;

        const productCard =
            button.closest(".product-card");

        let image = "";

        if (productCard) {

            const productImage =
                productCard.querySelector("img");

            if (productImage) {
                image = productImage.src;
            }
        }

        addToCart(name, price, image);
    }
);



function updateCartCount() {

    if (!cartCount) return;

    const totalQuantity = cart.reduce(
        function (total, item) {

            return total + Number(item.quantity);

        },
        0
    );

    cartCount.textContent = totalQuantity;
}



function renderCart() {

    if (!cartItems) return;

    cartItems.innerHTML = "";

    const isEmpty = cart.length === 0;

    if (emptyCart) {
        emptyCart.hidden = !isEmpty;
    }

    if (cartContent) {
        cartContent.hidden = isEmpty;
    }

    cart.forEach(function (item, index) {

        const row = document.createElement("tr");

        const itemTotal =
            item.price * item.quantity;

        row.innerHTML = `
            <td class="cart-product">
                <div class="cart-product-info">

                    ${
                        item.image
                        ? `
                            <img
                                src="${item.image}"
                                alt=""
                                class="cart-product-image">
                        `
                        : ""
                    }

                    <span>${escapeHTML(item.name)}</span>

                </div>
            </td>

            <td>
                $${item.price.toFixed(2)}
            </td>

            <td>
                <div class="quantity-controls">

                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="decrease"
                        data-index="${index}"
                        aria-label="Decrease quantity">
                        −
                    </button>

                    <span class="quantity">
                        ${item.quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="increase"
                        data-index="${index}"
                        aria-label="Increase quantity">
                        +
                    </button>

                </div>
            </td>

            <td>
                $${itemTotal.toFixed(2)}
            </td>

            <td>
                <button
                    type="button"
                    class="remove-btn"
                    data-action="remove"
                    data-index="${index}">
                    Remove
                </button>
            </td>
        `;

        cartItems.appendChild(row);

    });

    updateCartCount();

    updateCartTotals();
}



function escapeHTML(text) {

    const element = document.createElement("div");

    element.textContent = String(text);

    return element.innerHTML;
}



function updateCartTotals() {

    const subtotal = cart.reduce(
        function (total, item) {

            return total +
                item.price * item.quantity;

        },
        0
    );

    const shipping = subtotal === 0
        ? 0
        : subtotal >= 50
            ? 0
            : 5;

    const grandTotal =
        subtotal + shipping;

    if (subtotalElement) {
        subtotalElement.textContent =
            "$" + subtotal.toFixed(2);
    }

    if (shippingElement) {
        shippingElement.textContent =
            shipping === 0
                ? "FREE"
                : "$" + shipping.toFixed(2);
    }

    if (grandTotalElement) {
        grandTotalElement.textContent =
            "$" + grandTotal.toFixed(2);
    }
}



if (cartItems) {

    cartItems.addEventListener(
        "click",
        function (event) {

            const button = event.target.closest(
                "[data-action]"
            );

            if (!button) return;

            const action = button.dataset.action;

            const index = Number(
                button.dataset.index
            );

            if (
                !Number.isInteger(index) ||
                !cart[index]
            ) {
                return;
            }

            if (action === "increase") {

                cart[index].quantity += 1;

            } else if (action === "decrease") {

                cart[index].quantity -= 1;

                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }

            } else if (action === "remove") {

                cart.splice(index, 1);

            }

            saveCart();

            renderCart();
        }
    );
}



function showCartMessage(name) {

    const modal = document.getElementById(
        "cart-success-modal"
    );

    const message = document.getElementById(
        "cart-success-message"
    );

    if (message) {

        message.textContent =
            name + " has been added to your cart.";

    }

    if (modal) {

        modal.classList.add("show");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );
    }
}


function closeCartMessage() {

    const modal = document.getElementById(
        "cart-success-modal"
    );

    if (!modal) return;

    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


const cartModalClose = document.getElementById(
    "cart-modal-close"
);

if (cartModalClose) {
    cartModalClose.addEventListener(
        "click",
        closeCartMessage
    );
}


const continueShoppingBtn =
    document.getElementById(
        "continue-shopping-btn"
    );

if (continueShoppingBtn) {

    continueShoppingBtn.addEventListener(
        "click",
        closeCartMessage
    );
}



const browseCoffeesBtn =
    document.getElementById(
        "browse-coffees-btn"
    );

if (browseCoffeesBtn) {

    browseCoffeesBtn.addEventListener(
        "click",
        function () {

            showPage("coffees");

        }
    );
}


const coffeeSearch = document.getElementById(
    "coffee-search"
);

const clearCoffeeSearch =
    document.getElementById(
        "clear-coffee-search"
    );


function searchCoffee() {

    if (!coffeeSearch) return;

    const searchText =
        coffeeSearch.value.toLowerCase().trim();

    const products = document.querySelectorAll(
        "#coffees .product-card"
    );

    products.forEach(function (product) {

        const productText =
            product.textContent.toLowerCase();

        product.style.display =
            productText.includes(searchText)
                ? ""
                : "none";
    });
}


if (coffeeSearch) {

    coffeeSearch.addEventListener(
        "input",
        searchCoffee
    );
}


if (clearCoffeeSearch) {

    clearCoffeeSearch.addEventListener(
        "click",
        function () {

            if (coffeeSearch) {
                coffeeSearch.value = "";
            }

            searchCoffee();
        }
    );
}



const discountOpen = document.getElementById(
    "discount-open"
);

const discountClose = document.getElementById(
    "discount-close"
);

const discountModal = document.getElementById(
    "discount-modal"
);


function openDiscountModal() {

    if (!discountModal) return;

    discountModal.classList.add("show");

    discountModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeDiscountModal() {

    if (!discountModal) return;

    discountModal.classList.remove("show");

    discountModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


if (discountOpen) {

    discountOpen.addEventListener(
        "click",
        openDiscountModal
    );
}


if (discountClose) {

    discountClose.addEventListener(
        "click",
        closeDiscountModal
    );
}



const newsletterForm = document.getElementById(
    "newsletter-form"
);

if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const emailInput =
                document.getElementById(
                    "newsletter-email"
                );

            if (
                !emailInput ||
                !emailInput.checkValidity()
            ) {
                alert("Please enter a valid email.");
                return;
            }

            alert(
                "Thank you for subscribing! " +
                "Your discount is ready."
            );

            newsletterForm.reset();

            closeDiscountModal();
        }
    );
}


const checkoutBtn = document.getElementById(
    "checkout-btn"
);

const paymentModal = document.getElementById(
    "paymentModal"
);

const paymentClose = document.getElementById(
    "payment-close"
);

const paymentAmount = document.getElementById(
    "paymentAmount"
);

const paymentContinue = document.getElementById(
    "payment-continue"
);

let selectedPayment = "";


function openPaymentModal() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }

    if (!paymentModal) return;

    if (paymentAmount && grandTotalElement) {

        paymentAmount.textContent =
            grandTotalElement.textContent;
    }

    paymentModal.classList.add("show");
}


function closePaymentModal() {

    if (!paymentModal) return;

    paymentModal.classList.remove("show");
}


if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        openPaymentModal
    );
}


if (paymentClose) {

    paymentClose.addEventListener(
        "click",
        closePaymentModal
    );
}



document.querySelectorAll(
    ".payment-option"
).forEach(function (option) {

    option.addEventListener(
        "click",
        function () {

            document.querySelectorAll(
                ".payment-option"
            ).forEach(function (item) {

                item.classList.remove("selected");

            });

            option.classList.add("selected");

            selectedPayment =
                option.dataset.payment ||
                option.textContent.trim();
        }
    );
});



if (paymentContinue) {

    paymentContinue.addEventListener(
        "click",
        function () {

            if (!selectedPayment) {

                alert(
                    "Please select a payment method."
                );

                return;
            }

            if (cart.length === 0) {

                alert("Your cart is empty.");

                return;
            }

            closePaymentModal();

            cart = [];

            saveCart();

            renderCart();

            showPage("payment-success");

        }
    );
}



const backHomeBtn = document.getElementById(
    "back-home-btn"
);

if (backHomeBtn) {

    backHomeBtn.addEventListener(
        "click",
        function () {

            showPage("home");

        }
    );
}


document.querySelectorAll(
    ".modal-overlay"
).forEach(function (modal) {

    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {

                modal.classList.remove("show");

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }
        }
    );
});



document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

        renderCart();

        showPage("home");

        closeMenu();

    }
);


/* Initialize immediately if DOM is already loaded */

if (document.readyState !== "loading") {

    loadCart();

    renderCart();

    showPage("home");

    closeMenu();
}
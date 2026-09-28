(() => {
    const cards = Array.from(document.querySelectorAll(".product-card"));
    const productGrid = document.querySelector(".product-grid");

    if (!cards.length || !productGrid) {
        return;
    }

    const products = cards.map((card, index) => {
        const name = card.querySelector("h3")?.textContent.trim() || `Prenda ${index + 1}`;
        const type = card.querySelector(".product-type")?.textContent.trim() || "Prenda";
        const priceText = card.querySelector(".product-info strong")?.textContent || "";
        const image = card.querySelector(".product-art img");

        return {
            id: String(index),
            name,
            type,
            price: Number(priceText.replace(/[^\d]/g, "")),
            image
        };
    });

    const cart = new Map();
    const formatCurrency = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });

    const styles = document.createElement("style");
    styles.textContent = `
        .musa-cart { margin: 0 0 28px; padding: 22px; border: 1px solid var(--border); border-radius: 14px; background: var(--soft); }
        .musa-cart h2 { margin: 0 0 14px; color: var(--navy); font: 400 1.65rem Georgia, serif; }
        .musa-cart-empty { margin: 0; color: var(--muted); }
        .musa-cart-list { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
        .musa-cart-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
        .musa-cart-item-name { display: block; color: var(--navy); font-weight: 700; }
        .musa-cart-item-price { display: block; margin-top: 4px; color: var(--muted); font-size: .9rem; }
        .musa-cart-controls { display: flex; align-items: center; gap: 8px; }
        .musa-cart-button, .musa-cart-remove, .musa-add-button { min-height: 38px; border: 1px solid var(--border); border-radius: 8px; background: #fff; color: var(--navy); font: inherit; cursor: pointer; }
        .musa-cart-button { width: 38px; font-size: 1.1rem; }
        .musa-cart-quantity { min-width: 20px; text-align: center; font-weight: 700; }
        .musa-cart-remove { padding: 0 10px; color: var(--muted); font-size: .85rem; }
        .musa-cart-total { display: flex; justify-content: space-between; gap: 16px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); color: var(--navy); font-size: 1.1rem; font-weight: 800; }
        .musa-checkout { width: 100%; min-height: 46px; margin-top: 16px; padding: 10px 16px; border: 0; border-radius: 8px; background: var(--primary); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
        .musa-checkout:hover:not(:disabled) { background: var(--primary-hover); }
        .musa-checkout:disabled { cursor: not-allowed; opacity: .55; }
        .musa-add-button { width: 100%; margin-top: 16px; padding: 8px 12px; font-weight: 700; }
        .musa-add-button:hover, .musa-cart-button:hover, .musa-cart-remove:hover { border-color: var(--primary); }
        .musa-image-button { display: block; width: 100%; height: 100%; padding: 0; overflow: hidden; border: 0; background: transparent; cursor: pointer; }
        .musa-image-button:focus-visible, .musa-add-button:focus-visible, .musa-cart button:focus-visible { outline: 3px solid var(--primary); outline-offset: 3px; }
        @media (max-width: 480px) {
            .musa-cart { padding: 16px; }
            .musa-cart-item { grid-template-columns: 1fr; }
            .musa-cart-controls { justify-content: flex-start; }
        }
    `;
    document.head.append(styles);

    const cartSection = document.createElement("section");
    cartSection.className = "musa-cart";
    cartSection.setAttribute("aria-label", "Carrito de compras");
    cartSection.setAttribute("aria-live", "polite");

    const cartTitle = document.createElement("h2");
    cartTitle.textContent = "Tu carrito";

    const cartContent = document.createElement("div");
    const productList = document.createElement("ul");
    productList.className = "musa-cart-list";

    const emptyMessage = document.createElement("p");
    emptyMessage.className = "musa-cart-empty";
    emptyMessage.textContent = "Aún no has agregado prendas.";

    const totalLine = document.createElement("div");
    totalLine.className = "musa-cart-total";
    const totalLabel = document.createElement("span");
    totalLabel.textContent = "Total";
    const totalValue = document.createElement("span");
    totalValue.textContent = formatCurrency.format(0);
    totalLine.append(totalLabel, totalValue);

    const checkoutButton = document.createElement("button");
    checkoutButton.className = "musa-checkout";
    checkoutButton.type = "button";
    checkoutButton.textContent = "Finalizar compra por WhatsApp";
    checkoutButton.disabled = true;

    cartContent.append(emptyMessage, productList, totalLine, checkoutButton);
    cartSection.append(cartTitle, cartContent);
    productGrid.before(cartSection);

    function addProduct(product) {
        const current = cart.get(product.id);
        cart.set(product.id, { product, quantity: (current?.quantity || 0) + 1 });
        renderCart();
    }

    function renderCart() {
        productList.replaceChildren();
        let total = 0;

        for (const { product, quantity } of cart.values()) {
            const lineTotal = product.price * quantity;
            total += lineTotal;

            const item = document.createElement("li");
            item.className = "musa-cart-item";

            const details = document.createElement("div");
            const name = document.createElement("span");
            name.className = "musa-cart-item-name";
            name.textContent = product.name;
            const price = document.createElement("span");
            price.className = "musa-cart-item-price";
            price.textContent = `${quantity} x ${formatCurrency.format(product.price)} = ${formatCurrency.format(lineTotal)}`;
            details.append(name, price);

            const controls = document.createElement("div");
            controls.className = "musa-cart-controls";

            const decreaseButton = document.createElement("button");
            decreaseButton.className = "musa-cart-button";
            decreaseButton.type = "button";
            decreaseButton.textContent = "-";
            decreaseButton.setAttribute("aria-label", `Restar una unidad de ${product.name}`);
            decreaseButton.addEventListener("click", () => {
                if (quantity === 1) {
                    cart.delete(product.id);
                } else {
                    cart.set(product.id, { product, quantity: quantity - 1 });
                }
                renderCart();
            });

            const quantityLabel = document.createElement("span");
            quantityLabel.className = "musa-cart-quantity";
            quantityLabel.textContent = String(quantity);

            const increaseButton = document.createElement("button");
            increaseButton.className = "musa-cart-button";
            increaseButton.type = "button";
            increaseButton.textContent = "+";
            increaseButton.setAttribute("aria-label", `Agregar otra unidad de ${product.name}`);
            increaseButton.addEventListener("click", () => addProduct(product));

            const removeButton = document.createElement("button");
            removeButton.className = "musa-cart-remove";
            removeButton.type = "button";
            removeButton.textContent = "Quitar";
            removeButton.addEventListener("click", () => {
                cart.delete(product.id);
                renderCart();
            });

            controls.append(decreaseButton, quantityLabel, increaseButton, removeButton);
            item.append(details, controls);
            productList.append(item);
        }

        const isEmpty = cart.size === 0;
        emptyMessage.hidden = !isEmpty;
        productList.hidden = isEmpty;
        totalLine.hidden = isEmpty;
        totalValue.textContent = formatCurrency.format(total);
        checkoutButton.disabled = isEmpty;

        for (const product of products) {
            const quantity = cart.get(product.id)?.quantity || 0;
            product.addButtons.forEach((button) => {
                button.textContent = quantity ? `Agregar otra (${quantity})` : "Agregar al carrito";
            });
        }
    }

    for (const product of products) {
        product.addButtons = [];
        const card = cards[Number(product.id)];
        const image = product.image;

        if (image) {
            const imageButton = document.createElement("button");
            imageButton.className = "musa-image-button";
            imageButton.type = "button";
            imageButton.setAttribute("aria-label", `Agregar ${product.name} al carrito`);
            image.parentElement.replaceChild(imageButton, image);
            imageButton.append(image);
            imageButton.addEventListener("click", () => addProduct(product));
        }

        const addButton = document.createElement("button");
        addButton.className = "musa-add-button";
        addButton.type = "button";
        addButton.textContent = "Agregar al carrito";
        addButton.addEventListener("click", () => addProduct(product));
        card.querySelector(".product-info")?.append(addButton);
        product.addButtons.push(addButton);
    }

    checkoutButton.addEventListener("click", () => {
        const lines = Array.from(cart.values()).map(({ product, quantity }) => {
            const subtotal = formatCurrency.format(product.price * quantity);
            return `* ${product.type}: ${product.name.toLocaleLowerCase("es")} x${quantity}: ${subtotal}`;
        });
        const total = Array.from(cart.values()).reduce(
            (sum, { product, quantity }) => sum + product.price * quantity,
            0
        );
        const message = [
            "Hola, quiero realizar este pedido:",
            "",
            ...lines,
            "",
            `Total cotizado: ${formatCurrency.format(total)}`
        ].join("\n");
        const whatsappUrl = `https://wa.me/573116019896?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });

    renderCart();
})();
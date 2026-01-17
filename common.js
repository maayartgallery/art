window.addEventListener("DOMContentLoaded", () => {

    const folders = [
        "acrylic_painting",
        "mandala_art",
        "charcoal",
        "color_pencil",
        "fabric_painting",
        "oil_pastel_drawing",
        "resin_art",
        "water_colour_painting"
    ];

    const categoryContainer = document.getElementById("category-container");
    const wrapper = document.querySelector(".category-scroll-wrapper");
    const collectionButtons = document.getElementById("collection-buttons");

    let scrollPos = 0;
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;
    const speed = 0.6;

    let galleryImages = [];
    let currentIndex = 0;

    function formatName(folder) {
        return folder.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }

    const slides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;

    function nextSlide() {
        slides.forEach(s => s.classList.remove("active"));
        slides[currentSlide].classList.add("active");
        currentSlide = (currentSlide + 1) % slides.length;
    }

    if (slides.length) {
        nextSlide();
        setInterval(nextSlide, 4000);
    }

    function autoImageSlider(card, folder) {
        let front = card.querySelector(".img-front");
        let back = card.querySelector(".img-back");

        let images = [];
        let index = 1;
        let current = 0;
        let direction = "left";

        function preloadNext() {
            const img = new Image();
            img.src = `https://raw.githubusercontent.com/maayartgallery/art/main/images/${folder}/${index}.jpg`;

            img.onload = () => {
                images.push(index);
                index++;
                preloadNext();
            };

            img.onerror = () => {
                if (images.length > 0) startSlider();
            };
        }

        function startSlider() {
            front.src = `https://raw.githubusercontent.com/maayartgallery/art/main/images/${folder}/${images[0]}.jpg`;

            setInterval(() => {
                const nextIndex = (current + 1) % images.length;
                back.src = `https://raw.githubusercontent.com/maayartgallery/art/main/images/${folder}/${images[nextIndex]}.jpg`;

                front.className = `category-image img-front ${direction === "left" ? "out-left" : "out-right"}`;
                back.className = `category-image img-back ${direction === "left" ? "in-right" : "in-left"}`;

                [front, back] = [back, front];
                current = nextIndex;
                direction = direction === "left" ? "right" : "left";
            }, 2200);
        }

        preloadNext();
    }

    if (categoryContainer) {
        const cards = [];

        folders.forEach(folder => {
            const col = document.createElement("div");
            col.className = "col-md-4 mb-4";

            col.innerHTML = `
                <div class="category-card">
                    <img class="category-image img-front">
                    <img class="category-image img-back">
                    <div class="category-overlay">
                        <h3 class="category-title">${formatName(folder)}</h3>
                        <p class="category-subtitle">Explore ${formatName(folder)} Collection</p>
                    </div>
                </div>
            `;

            const card = col.querySelector(".category-card");
            autoImageSlider(card, folder);
            card.addEventListener("click", () => showGallery(folder));

            categoryContainer.appendChild(col);
            cards.push({ col, folder });
        });

        cards.forEach(({ col, folder }) => {
            const clone = col.cloneNode(true);
            const cloneCard = clone.querySelector(".category-card");
            autoImageSlider(cloneCard, folder);
            cloneCard.addEventListener("click", () => showGallery(folder));
            categoryContainer.appendChild(clone);
        });
    }

    function autoScroll() {
        scrollPos += speed;
        if (scrollPos >= categoryContainer.scrollWidth / 2) scrollPos = 0;
        categoryContainer.style.transform = `translateX(-${scrollPos}px)`;
        requestAnimationFrame(autoScroll);
    }
    autoScroll();

    wrapper.addEventListener("wheel", e => {
        e.preventDefault();
        scrollPos += e.deltaY;
    }, { passive: false });

    wrapper.addEventListener("mousedown", e => {
        isDragging = true;
        startX = e.pageX;
        scrollStart = scrollPos;
        wrapper.style.cursor = "grabbing";
    });

    ["mouseup", "mouseleave"].forEach(ev =>
        wrapper.addEventListener(ev, () => {
            isDragging = false;
            wrapper.style.cursor = "grab";
        })
    );

    wrapper.addEventListener("mousemove", e => {
        if (!isDragging) return;
        scrollPos = scrollStart - (e.pageX - startX);
    });

    folders.forEach((folder, idx) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-dark collection-btn m-2";
        btn.innerText = formatName(folder);
        btn.addEventListener("click", () => showGallery(folder));
        btn.style.animation = "throwDownBounce 0.8s ease forwards";
        btn.style.animationDelay = `${idx * 0.15}s`;
        collectionButtons.appendChild(btn);
    });

    window.showGallery = function (folder) {
        const grid = document.getElementById("gallery-grid");
        const title = document.getElementById("gallery-title");
        const section = document.getElementById("dynamic-gallery");

        title.innerText = `${formatName(folder)} Collection`;
        grid.innerHTML = "";
        galleryImages = [];

        let index = 1;

        function loadNext() {
            const imgPath = `https://raw.githubusercontent.com/maayartgallery/art/main/images/${folder}/${index}.jpg`;
            const img = new Image();
            img.src = imgPath;

            img.onload = () => {
                const item = document.createElement("div");
                item.className = "gallery-item";

                item.innerHTML = `
                    <img src="${imgPath}">
                    <div class="gallery-info">
                        <h4>${formatName(folder)}</h4>
                    </div>
                `;

                galleryImages.push(imgPath);

                item.querySelector("img").addEventListener("click", () => {
                    openImagePopup(galleryImages.indexOf(imgPath));
                });

                grid.appendChild(item);
                index++;
                loadNext();
            };

            img.onerror = () => {
                console.log("Gallery load complete");
            };
        }

        loadNext();

        document.getElementById("categories").style.display = "none";
        section.style.display = "block";
        section.scrollIntoView({ behavior: "smooth" });
    };

    window.hideGallery = function () {
        document.getElementById("dynamic-gallery").style.display = "none";
        document.getElementById("categories").style.display = "block";
    };

    function openImagePopup(index) {
        currentIndex = index;
        document.getElementById("popup-img").src = galleryImages[currentIndex];
        document.getElementById("image-popup").classList.add("active");
    }

    function closeImagePopup() {
        document.getElementById("image-popup").classList.remove("active");
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        document.getElementById("popup-img").src = galleryImages[currentIndex];
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        document.getElementById("popup-img").src = galleryImages[currentIndex];
    }

    document.querySelector(".popup-close").addEventListener("click", closeImagePopup);
    document.querySelector(".popup-nav.next").addEventListener("click", showNext);
    document.querySelector(".popup-nav.prev").addEventListener("click", showPrev);

    document.getElementById("image-popup").addEventListener("click", e => {
        if (e.target.id === "image-popup") closeImagePopup();
    });

    document.addEventListener("keydown", e => {
        if (!document.getElementById("image-popup").classList.contains("active")) return;
        if (e.key === "Escape") closeImagePopup();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft") showPrev();
    });

    window.handleSubmit = function(event) {
        event.preventDefault();

        const form = event.target;

        let timeInput = form.querySelector('input[name="sent_time"]');
        if (!timeInput) {
            timeInput = document.createElement("input");
            timeInput.type = "hidden";
            timeInput.name = "sent_time";
            form.appendChild(timeInput);
        }
        timeInput.value = new Date().toLocaleString();

        emailjs.sendForm(
            "service_f05hrny",
            "template_8enb95h",
            form,
            "zQPuiBz4dcjJz1wbJ"
        ).then(
            function(response) {
                alert("Thank you! Your enquiry has been sent successfully.");
                form.reset();
            },
            function(error) {
                console.error("Failed to send email:", error);
                alert("Oops! Something went wrong. Check console for details.");
            }
        );
    };

});


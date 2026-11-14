
/* =========================================
   MUSIC PLAYER
========================================= */

const audio = document.getElementById("audio-player");

if (audio) {
    const tracks = [
        {
            title: "Lick the Night",
            file: "music/Lick_the_night.mp3"
        },
        {
            title: "LoFi Asparagus",
            file: "music/lOfI_ASPARAGUs.mp3"
        }
    ];

    const progressBar = document.getElementById("progress-bar");
    const currentTimeDisplay = document.getElementById("current-time");
    const durationDisplay = document.getElementById("duration");
    const playButton = document.getElementById("play-pause");
    const prevButton = document.getElementById("prev-track");
    const nextButton = document.getElementById("next-track");
    const trackItems = document.querySelectorAll(".track-item");

    let currentTrack = 0;

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function updatePlayButton() {
        if (!playButton) return;

        playButton.textContent = audio.paused ? "▶" : "Ⅱ";
    }

    function loadTrack(index) {
        currentTrack = (index + tracks.length) % tracks.length;

        audio.src = tracks[currentTrack].file;

        trackItems.forEach((item, i) => {
            item.classList.toggle("active", i === currentTrack);
        });
    }

    function playTrack() {
        audio.play()
            .then(updatePlayButton)
            .catch(error => {
                console.error("Unable to play audio:", error);
                updatePlayButton();
            });
    }

    function pauseTrack() {
        audio.pause();
        updatePlayButton();
    }

    if (playButton) {
        playButton.addEventListener("click", () => {
            if (audio.paused) {
                playTrack();
            } else {
                pauseTrack();
            }
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            loadTrack(currentTrack - 1);
            playTrack();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            loadTrack(currentTrack + 1);
            playTrack();
        });
    }

    trackItems.forEach(item => {
        item.addEventListener("click", () => {
            const index = Number(item.dataset.track);

            if (Number.isInteger(index) && index >= 0 && index < tracks.length) {
                loadTrack(index);
                playTrack();
            }
        });
    });

    audio.addEventListener("ended", () => {
        loadTrack(currentTrack + 1);
        playTrack();
    });

    audio.addEventListener("play", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);

    audio.addEventListener("loadedmetadata", () => {
        if (progressBar) {
            progressBar.max = audio.duration;
        }

        if (durationDisplay) {
            durationDisplay.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener("timeupdate", () => {
        if (progressBar) {
            progressBar.value = audio.currentTime;
        }

        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(audio.currentTime);
        }
    });

    if (progressBar) {
        progressBar.addEventListener("input", () => {
            audio.currentTime = Number(progressBar.value);
        });
    }

    loadTrack(0);
}


/* =========================================
   LATEST BLOG POST
========================================= */

const latestPostContainer = document.getElementById("latest-post");

if (latestPostContainer) {
    fetch("blog.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to load blog page.");
            }

            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const blogPage = parser.parseFromString(html, "text/html");

            const latestPost = blogPage.querySelector(".blog-post");

            if (!latestPost) {
                latestPostContainer.textContent = "No blog posts yet.";
                return;
            }

            const date = latestPost.querySelector(".post-date");
            const title = latestPost.querySelector("h2");
            const content = latestPost.querySelector("p:not(.post-date)");

            if (!date || !title || !content) {
                throw new Error("The latest blog post is missing required information.");
            }

            latestPostContainer.innerHTML = `
                <p class="post-date"></p>
                <h3></h3>
                <p></p>
            `;

            latestPostContainer.querySelector(".post-date").textContent = date.textContent;
            latestPostContainer.querySelector("h3").textContent = title.textContent;
            latestPostContainer.querySelector("p:last-child").innerHTML = content.innerHTML;
        })
        .catch(error => {
            console.error("Error loading latest blog post:", error);
            latestPostContainer.textContent = "Unable to load the latest blog post.";
        });
}


/* =========================================
   FEATURED PHOTO
========================================= */

const featuredPhotoImage = document.getElementById("featured-photo-image");

if (featuredPhotoImage) {
    fetch("photos.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to load photos page.");
            }

            return response.text();
        })
        .then(async html => {
            const parser = new DOMParser();
            const photosPage = parser.parseFromString(html, "text/html");

            const latestCollection = photosPage.querySelector(".photo-collection");

            if (!latestCollection) {
                throw new Error("No photo collection found.");
            }

            const images = Array.from(
                latestCollection.querySelectorAll(".photo-grid img")
            );

            const landscapeImages = await Promise.all(
                images.map(image => {
                    return new Promise(resolve => {
                        const img = new Image();

                        img.onload = () => {
                            resolve(
                                img.naturalWidth > img.naturalHeight ? image : null
                            );
                        };

                        img.onerror = () => resolve(null);
                        img.src = image.getAttribute("src");
                    });
                })
            );

            const eligibleImages = landscapeImages.filter(Boolean);

            if (eligibleImages.length === 0) {
                throw new Error("No landscape photos found in the latest collection.");
            }

            const randomImage = eligibleImages[
                Math.floor(Math.random() * eligibleImages.length)
            ];

            const title = latestCollection.querySelector("h2");
            const date = latestCollection.querySelector(".photo-date");
            const description = latestCollection.querySelector("p:not(.photo-date)");

            const titleElement = document.getElementById("featured-photo-title");
            const dateElement = document.getElementById("featured-photo-date");
            const descriptionElement = document.getElementById("featured-photo-description");

            if (!title || !date || !description || !titleElement || !dateElement || !descriptionElement) {
                throw new Error("Featured photo section is missing required elements.");
            }

            featuredPhotoImage.src = randomImage.getAttribute("src");
            featuredPhotoImage.alt = randomImage.alt;

            titleElement.textContent = title.textContent;
            dateElement.textContent = date.textContent;
            descriptionElement.textContent = description.textContent;
        })
        .catch(error => {
            console.error("Error loading featured photo:", error);
        });
}


/* =========================================
   PHOTO GALLERY LIGHTBOX
========================================= */

const lightbox = document.getElementById("photo-lightbox");

if (lightbox) {
    const photoCounter = document.getElementById("photo-counter");
    const lightboxImage = document.getElementById("lightbox-image");
    const closeButton = document.getElementById("close-lightbox");
    const prevButton = document.getElementById("prev-photo");
    const nextButton = document.getElementById("next-photo");

    const photos = Array.from(document.querySelectorAll(".photo-grid img"));

    let currentPhoto = 0;

    function showPhoto(index) {
        if (photos.length === 0) return;

        currentPhoto = (index + photos.length) % photos.length;

        lightboxImage.src = photos[currentPhoto].src;
        lightboxImage.alt = photos[currentPhoto].alt;

        photoCounter.textContent = `${currentPhoto + 1} / ${photos.length}`;
    }

    if (
        lightboxImage &&
        photoCounter &&
        closeButton &&
        prevButton &&
        nextButton &&
        photos.length > 0
    ) {
        photos.forEach((photo, index) => {
            photo.addEventListener("click", () => {
                showPhoto(index);
                lightbox.showModal();
            });
        });

        prevButton.addEventListener("click", () => {
            showPhoto(currentPhoto - 1);
        });

        nextButton.addEventListener("click", () => {
            showPhoto(currentPhoto + 1);
        });

        closeButton.addEventListener("click", () => {
            lightbox.close();
        });

        lightbox.addEventListener("click", event => {
            if (event.target === lightbox) {
                lightbox.close();
            }
        });

        document.addEventListener("keydown", event => {
            if (!lightbox.open) return;

            if (event.key === "ArrowLeft") {
                showPhoto(currentPhoto - 1);
            } else if (event.key === "ArrowRight") {
                showPhoto(currentPhoto + 1);
            }
        });

        // Mobile swipe navigation

        let touchStartX = 0;
        let touchStartY = 0;

        lightboxImage.addEventListener("touchstart", event => {
            touchStartX = event.changedTouches[0].screenX;
            touchStartY = event.changedTouches[0].screenY;
        }, { passive: true });

        lightboxImage.addEventListener("touchend", event => {
            const touchEndX = event.changedTouches[0].screenX;
            const touchEndY = event.changedTouches[0].screenY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) < 50) return;
            if (Math.abs(deltaX) < Math.abs(deltaY)) return;

            if (deltaX < 0) {
                showPhoto(currentPhoto + 1);
            } else {
                showPhoto(currentPhoto - 1);
            }
        }, { passive: true });
    }
}


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
   BLOG POSTS
========================================= */

async function loadBlogPosts() {
    const response = await fetch("blog-posts/posts.json");

    if (!response.ok) {
        throw new Error("Unable to load blog post list.");
    }

    const posts = await response.json();

    return Promise.all(
        posts.map(async post => {
            const postResponse = await fetch(`blog-posts/${post.file}`);

            if (!postResponse.ok) {
                throw new Error(`Unable to load ${post.file}`);
            }

            const markdown = await postResponse.text();

            return {
                ...post,
                content: marked.parse(markdown)
            };
        })
    );
}


/* FULL BLOG PAGE */

const blogPostsContainer = document.getElementById("blog-posts");

if (blogPostsContainer) {
    loadBlogPosts()
        .then(posts => {
            blogPostsContainer.innerHTML = posts.map(post => `
                <section class="blog-post">
                    <p class="post-date">${post.date}</p>
                    <h2>${post.title}</h2>
                    <div class="post-content">${post.content}</div>
                </section>
            `).join("");
        })
        .catch(error => {
            console.error("Error loading blog posts:", error);
            blogPostsContainer.textContent = "Unable to load blog posts.";
        });
}


/* HOMEPAGE LATEST POST */

const latestPostContainer = document.getElementById("latest-post");

if (latestPostContainer) {
    loadBlogPosts()
    .then(posts => {
        if (posts.length === 0) {
            latestPostContainer.textContent = "No blog posts yet.";
            return;
        }

        const post = posts[0];

        // Convert rendered HTML into separate paragraphs
        const tempElement = document.createElement("div");
        tempElement.innerHTML = post.content;

        const paragraphs = Array.from(tempElement.querySelectorAll("p"))
        .map(paragraph => paragraph.textContent.trim())
        .filter(text => text !== "");

        latestPostContainer.innerHTML = `
        <p class="post-date">${post.date}</p>
        <h3>${post.title}</h3>
        <div class="post-preview">
        ${paragraphs.map(paragraph => `<p></p>`).join("")}
        </div>
        `;

        const previewParagraphs = latestPostContainer.querySelectorAll(".post-preview p");

        paragraphs.forEach((paragraph, index) => {
            previewParagraphs[index].textContent = paragraph;
        });
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


/* CURRENT STATUS */

const currentStatus = document.getElementById("current-status");

if (currentStatus) {
    fetch("status/statuses.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to load statuses.");
        }

        return response.json();
    })
    .then(statuses => {
        if (statuses.length === 0) {
            currentStatus.textContent = "No status yet.";
            return;
        }

        currentStatus.textContent = statuses[0].text;
        currentStatus.style.whiteSpace = "pre-line";
    })
    .catch(error => {
        console.error("Error loading status:", error);
        currentStatus.textContent = "Unable to load status.";
    });
}

/* STATUS HISTORY */

const statusList = document.getElementById("status-list");

if (statusList) {
    fetch("status/statuses.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to load statuses.");
        }

        return response.json();
    })
    .then(statuses => {
        if (statuses.length === 0) {
            statusList.textContent = "No statuses yet.";
            return;
        }

        statusList.innerHTML = statuses.map((status, index) => `
        <article class="status-entry ${index % 2 === 0 ? "status-green" : "status-dark"}">
        <p class="status-date">${status.date}</p>
        <p class="status-text"></p>
        </article>
        `).join("");

        const statusTexts = statusList.querySelectorAll(".status-text");

        statuses.forEach((status, index) => {
            statusTexts[index].textContent = status.text;
        });
    })
    .catch(error => {
        console.error("Error loading status history:", error);
        statusList.textContent = "Unable to load status history.";
    });
}

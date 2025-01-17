// eslint-disable-next-line no-unused-vars
import { getPhotographer, getAllMedia, initData, sortMediaObjects, setLightboxMedia } from "../../utils/data.js";
import { isInteger } from "../../utils/utils.js";
import { createSelectbox } from "./component/selectbox.js";
import { displayContactModal, initContactModal } from "./modals/contact.js";
import { initLightbox, showLightboxModal } from './modals/lightbox.js';
import { UIElements } from "./UIElements.js";

/**
 * @typedef {import("../../utils/data.js").PhotographerObject} PhotographerObject
 * @typedef {import("../../utils/data.js").MediaObject} MediaObject
 */

/** @callback eventCallback
 * @param {MouseEvent} e
 * @returns {void}
 */

/**
 * Generate header content
 * @param {PhotographerObject} photographer 
 * @param {eventCallback} onClick Linked to contact button
 */
const HeaderFactory = (photographer, onClick) => {
    const header = document.querySelector(".photograph-header");
    const fragment = document.createDocumentFragment();

    // Add photographer info
    const headerInfo = document.createElement("div");
    headerInfo.innerHTML = `<h1>${photographer.name}</h1>
        <address class="header-city">
          ${photographer.city}, ${photographer.country}
        </address>
        <p class="header-tagline">
        ${photographer.tagline}
        </p>`
    
    // Add contact button
    const contactButton = document.createElement("button");
    contactButton.classList.add("header-contact-btn");
    contactButton.innerText = "Contactez-moi";
    contactButton.addEventListener("click", onClick);
    
    // Add image element
    const img = new Image();
    img.src = `assets/photographers/${photographer.portrait}`;
    img.alt = photographer.name;
    img.loading = "lazy";
    img.onerror = () => img.src = `assets/images/Missing_Image.svg`;

    fragment.appendChild(headerInfo);
    fragment.appendChild(contactButton);
    fragment.appendChild(img);
    header.appendChild(fragment);
}

/**
 * Create media card sub element
 * @param {string} title 
 * @param {number} likes 
 * @returns {HTMLDivElement}
 */
const createMediaCardSub = (title, likes) => {
    const mediaCardDOM = document.createElement("div");
    mediaCardDOM.classList.add("images_bottom");

    const titleDOM = document.createElement("p");
    titleDOM.innerHTML = title;

    const likesDOM = document.createElement("span");
    likesDOM.innerText = `${likes} `;
    
    const likesIcon = document.createElement("i");
    likesIcon.classList.add("fa-solid", "fa-heart");
    likesIcon.title = "Likes";
    likesIcon.addEventListener("click", (e) => {
        e.preventDefault();
        likesDOM.innerText = `${likes + 1} `;
        likesDOM.appendChild(likesIcon);
    });

    likesDOM.appendChild(likesIcon);
    mediaCardDOM.appendChild(titleDOM);
    mediaCardDOM.appendChild(likesDOM);
    return mediaCardDOM;
}

/**
 * Create media card content
 * @param {"img" | "video"} type 
 * @param {string} filename 
 * @param {string} title 
 * @returns {HTMLDivElement}
 */
const createMediaCardContent = (type, filename, title) => {
    const content = document.createElement(type);
    content.setAttribute("src", `assets/images/${filename}`);
    content.onerror = () => { type == "img" && content.setAttribute("src", `assets/images/Missing_Image.svg`) };
    content.setAttribute("alt", title);
    type == "img" && content.setAttribute("loading", "lazy");
    return content;
}
/**
 * Create media card
 * @param {MediaObject} media 
 * @param {number} index 
 * @returns {HTMLDivElement}
 */
const createMediaCard = (media, index) => {
    const { title, likes, image, video } = media;
    const userCardDOM = document.createElement("div");
    userCardDOM.id = `photographer-media-${index}`;
    const link = document.createElement("a");
    link.setAttribute("title", title);
    link.setAttribute("tabindex", "0");
    link.addEventListener("click", (e) => {
        e.preventDefault();
        showLightboxModal(UIElements.modal.lightboxModal, index);
    });
    
    let content = "";
    if (image) {
        link.setAttribute("href", `/photographer/media/${media.image}`);
        content = createMediaCardContent("img", image, title)
    } else {
        link.setAttribute("href", `/photographer/media/${media.video}`);
        content = createMediaCardContent("video", video, title);
    }

    link.appendChild(content);
    userCardDOM.appendChild(link);
    userCardDOM.appendChild(createMediaCardSub(title, likes));
    return userCardDOM;
}

/**
 * Create image gallery
 * @param {MediaObject[]} media 
 * @returns {TStat}
 */
const createGrid = async (media) => {
    const stats = {
        totalMedia: media.length,
        totalLikes: 0,
        totalPrice: 0,
    }

    const gridFrag = document.createDocumentFragment();
    media.forEach((mediaItem, i) => {
        gridFrag.appendChild(createMediaCard(mediaItem, i));
        stats.totalLikes += mediaItem.likes;
        stats.totalPrice += mediaItem.price;
    });
    UIElements.component.galleryGrid.replaceChildren(gridFrag);
    return stats;
};


/**
 * Initialize photographer page
 * @param {number} id Photographer id
 */
export const init = async (id) => {
    // Get all required data
    await initData();
    const photographer = await getPhotographer(id);
    const media = await getAllMedia(id);
    const sortedMedia = sortMediaObjects(media, "likes");
    
    // Initialize contact modal
    initContactModal(UIElements.modal.contactModal, photographer);
    //Create header
    HeaderFactory(photographer, () => {
        displayContactModal(UIElements.modal.contactModal);
    });
    
    // Initialize lightbox modal
    setLightboxMedia(sortedMedia);
    initLightbox(UIElements.modal.lightboxModal);

    //Create the selectbox
    createSelectbox(UIElements.component.selectbox, UIElements.component.selectboxData, ({ value }) => {
        const sortedMedia = sortMediaObjects(media, value.property);
        setLightboxMedia(sortedMedia);
        createGrid(sortedMedia);
    });

    //Update the floating elements data
    const mediaStat = await createGrid(sortedMedia);
    UIElements.component.counter.children[0].innerHTML = `${mediaStat.totalLikes} <i class="fa-solid fa-heart" title="Likes"></i>`;
    UIElements.component.counter.children[1].innerHTML = `${photographer.price} €`;

    
}

// Check if the parameter `id` exists in the url
let params = new URLSearchParams(document.location.search);
if (isInteger(params.get("id"))) {
    init(parseInt(params.get("id"), 10));
} else {
    document.location.href = "index.html";
}


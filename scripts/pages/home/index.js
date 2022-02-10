async function getPhotographers() {
    try {
        const response = await fetch('./data/photographers.json');
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { photographers: [] };
    }

}

async function displayData(photographers) {
    const photographersSection = document.querySelector(".photographer_section");

    photographers.forEach((photographer) => {
        const photographerModel = photographerFactory(photographer);
        const userCardDOM = photographerModel.getUserCardDOM();
        photographersSection.appendChild(userCardDOM);
    });
};

async function init() {
    // Récupère les datas des photographes
    const { photographers } = await getPhotographers();
    displayData(photographers);
};

init();
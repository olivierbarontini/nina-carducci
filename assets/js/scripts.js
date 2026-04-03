$(document).ready(function () {
  $(".gallery").mauGallery({
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 3,
      xl: 3,
    },
    lightBox: true,
    lightboxId: "myAwesomeLightbox",
    showTags: true,
    tagsPosition: "top",
  });

  // Ajout qui empêche le formulaire de se soumettre pour éviter le rechargement de la page (erreur 405)
  $("form").submit(function (e) {
    e.preventDefault();
  });
});

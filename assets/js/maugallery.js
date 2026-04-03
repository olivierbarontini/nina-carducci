(function ($) {
  // Plugin jQuery pour créer une galerie d'images avec lightbox et filtres par tags
  $.fn.mauGallery = function (options) {
    // Fusion des options par défaut avec celles fournies
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function () {
      // Création du wrapper de ligne pour les éléments de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        // Création de la lightbox si activée
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation,
        );
      }
      // Configuration des écouteurs d'événements
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function (index) {
          // Rendre l'image responsive
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          // Déplacer l'élément dans le wrapper de ligne
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          // Envelopper l'élément dans une colonne selon le nombre de colonnes
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            // Collecte des tags uniques pour les filtres
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        // Affichage des tags de filtrage
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection,
        );
      }

      // Animation d'apparition de la galerie
      $(this).fadeIn(500);
    });
  };
  // Options par défaut du plugin
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };
  // Configuration des écouteurs d'événements pour la galerie
  $.fn.mauGallery.listeners = function (options) {
    // Clic sur une image pour ouvrir la lightbox
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Clic sur un tag pour filtrer les images
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    // Navigation précédente dans la lightbox
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId),
    );
    // Navigation suivante dans la lightbox
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId),
    );
  };
  // Méthodes utilitaires du plugin
  $.fn.mauGallery.methods = {
    // Crée un wrapper de ligne pour contenir les éléments de la galerie
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    // Enveloppe chaque élément dans une colonne Bootstrap selon le nombre de colonnes
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`,
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`,
        );
      }
    },
    // Déplace l'élément dans le wrapper de ligne
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    // Rend l'image responsive en ajoutant la classe Bootstrap
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    // Ouvre la lightbox avec l'image cliquée
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    // -------------  Navigue vers l'image précédente dans la lightbox -------------------------------------------//

    prevImage() {
      let activeImage = null;

      // 1. Trouver l'image actuellement affichée dans la modale
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });

      // 2. Récupérer le tag actif (pour filtrer les images)
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];

      // 3. Construire la liste des images visibles selon le tag actif
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      // 4. Trouver l'index de l'image active dans la liste
      let index = 0;
      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });

      // 5. Calculer l'image précédente (navigation circulaire)
      // Si on est à la première image → revenir à la dernière
      let prev =
        index === 0
          ? imagesCollection[imagesCollection.length - 1]
          : imagesCollection[index - 1];

      // 6. Mettre à jour la modale avec la nouvelle image
      $(".lightboxImage").attr("src", $(prev).attr("src"));
    },
    // --------------------  Navigue vers l'image suivante dans la lightbox -------------------------------------------//
    nextImage() {
      let activeImage = null;

      // 1. Trouver l'image actuellement affichée dans la modale
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });

      // 2. Récupérer le tag actif (pour filtrer les images)
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];

      // 3. Construire la liste des images visibles selon le tag actif
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      // 4. Trouver l'index de l'image active dans la liste
      let index = 0;
      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });

      // 5. Calculer l'image suivante (navigation circulaire)
      // Si on est à la dernière image → revenir à la première
      let next =
        index === imagesCollection.length - 1
          ? imagesCollection[0]
          : imagesCollection[index + 1];

      // 6. Mettre à jour la modale avec la nouvelle image
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    // Crée la modale de lightbox avec navigation optionnelle
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    // Affiche la barre de tags pour filtrer les images
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      // Génère les éléments de tag
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      // Positionne la barre de tags
      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    // Filtre les images selon le tag sélectionné
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      // Met à jour le tag actif
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      // Cache ou affiche les éléments selon le tag
      $(".gallery-item").each(function () {
        $(this).parents(".item-column").hide();
        if (tag === "all") {
          $(this).parents(".item-column").show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });
    },
  };
})(jQuery);

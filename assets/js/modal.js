let modalCounter = 0;

/**
 * Crée et affiche une modale personnalisée.
 *
 * @param {string} title - Le titre principal de la modale.
 * @param {Array<{label: string, id: string, value: any}>} buttons - Tableau des boutons d'action avec leur libellé, ID et valeur de retour.
 * @param {string} [message=""] - Message optionnel à afficher sous le titre.
 * @param {Object} [options={}] - Options supplémentaires pour la modale.
 * @param {boolean} [options.showCloseButton=false] - Si true, ajoute un bouton "Fermer" en haut à droite.
 * @returns {Promise<any>} Une promesse qui se résout avec la valeur du bouton cliqué.
 *
 * @example
 * createModal(
 *   "Titre de la modale",
 *   [{ label: "OK", id: "ok-btn", value: true }],
 *   "Message optionnel",
 *   { showCloseButton: true }
 * ).then(result => console.log(result));
 */

function createModal(title, buttons, message = "", options = {}) {
  return new Promise((resolve) => {
    // Récupérer le bouton déclencheur pour restaurer le focus
    const trigger = document.activeElement;

    // Incrémentation automatique
    modalCounter++;
    const modalId = "modal-" + modalCounter;

    /**
     * Création de la modale
     */

      // Structure de la modale
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `<dialog class="modal-content" role="dialog" aria-modal="true" aria-labelledby="${modalId}">
      ${options.showCloseButton ? `<button class="btn-close" title="Fermer"><span aria-hidden="true">&times;</span></button>` : ""}
      <h1 class="modal-title" id="${modalId}">${title}</h1>
      ${message ? `<p class="modal-message">${message}</p>` : ""}
      <div class="group-buttons"></div>
    </dialog>`;

    // Ajouter les boutons d'actions
    const btnContainer = modal.querySelector(".group-buttons");
    buttons.forEach(btn => {
      const b = document.createElement("button");
      b.id = btn.id;
      b.classList = "btn " + btn.class;
      b.textContent = btn.label;
      b.addEventListener("click", () => {
        document.body.removeChild(modal);
        document.body.style.overflow = "";
        if (trigger) trigger.focus();
        resolve(btn.value);
      });
      btnContainer.appendChild(b);
    });

    // Ajouter le bouton fermer si demandé
    if (options.showCloseButton) {
      const closeBtn = modal.querySelector(".btn-close");
      closeBtn.addEventListener("click", () => {
        document.body.removeChild(modal);
        document.body.style.overflow = "";
        if (trigger) trigger.focus();
        resolve(false); // on peut retourner false pour un "cancel"
      });
    }

    // Empêcher le scroll en arrière-plan
    document.body.style.overflow = "hidden";

    // Injecter la modal dans le DOM
    document.body.appendChild(modal);

    // Ouvrir le <dialog>
    const dialog = modal.querySelector("dialog");
    dialog.showModal();


    /**
     * Focus Trap
     */

    // Récupère tous les éléments focusables dans la modal
    const focusables = modal.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Mettre le focus sur le premier élément focusable
    // first.focus();
    if (first) first.focus();

    // SHIFT + TAB = retour au dernier élément
    // TAB = retour au premier élément
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        }
        else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }

      // Empêcher Échap de sortir du focus (mais tu peux aussi fermer la modale ici si tu veux)
      if (e.key === "Escape") {
        e.stopPropagation();
        if (options.showCloseButton) {
          // simule clic sur le bouton fermer
          modal.querySelector(".btn-close").click();
        }
      }
    });
  });
}

/**
 * Affiche une modale de type message de confirmation avec boutons "Annuler" et "Confirmer".
 */

function messageModalConfirm(title, message = "") {
  return createModal(
    title, 
    [
      { label: "Annuler", id:"btn-confirm-modal-ko", class:"btn-cancel", value: false },
      { label: "Confirmer", id:"btn-confirm-modal-ok", class:"btn-confirm", value: true }
    ],
    message,
    { showCloseButton: false }
  );
}

/**
 * Affiche une modale de type message d'alerte avec un seul bouton "Fermer".
 */

function messageModalAlert(title, message = "") {
  return createModal(
    title,
    [],
    message,
    { showCloseButton: true }
  );
}

/**
 * Écoute l'évènement sur le bouton
 */

document.getElementById("btnAlert").addEventListener("click", async () => {
  const ok = await messageModalAlert(
    "Erreur", 
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit."
  );

  if (ok) {
    console.log("Confirmé");
  } else {
    console.log("Annulé ou fermé");
  }
});


document.getElementById("btnConfirm").addEventListener("click", async () => {
  const ok = await messageModalConfirm(
    "Confirmation d'action", 
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit."
  );

  if (ok) {
    console.log("Confirmé");
  } else {
    console.log("Annulé ou fermé");
  }
});
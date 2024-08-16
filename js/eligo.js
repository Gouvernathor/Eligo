import { VotingMethods } from "./eligo/constants.js";
// import { Candidat, Bulletin, BulletinSimple, BulletinApprobation, BulletinClassement, BulletinNotes } from "./eligo/classes.js";
// import { newRandomValue } from "./eligo/utils.js";

// définition des données : candidats, bulletins, votes
let votingMethod = null; // valeurs de votingMethods
let attributionMethod = null;
const candidats = new Map(); // candidat id -> Candidat
const bulletins = new Map(); // bulletin id -> Bulletin
const votes = new Map(); // bulletin id -> nombre de votes
let nbElecteurs = null; // null si automatique, number si manuel

// utils de lecture des données
/**
 * calcul de la somme du nombre de votes sur les bulletins du mode de vote actuel
 */
function computeNbVotes() {
    let value = 0;
    if (votingMethod)
        for (const [bid, nvotes] of votes.entries())
            if (bulletins.get(bid).kind === votingMethod)
                value += nvotes;
    return value;
}

// application des actions de clic aux boutons du formulaire

// application des ordres du formulaire aux données

// actualisation de données
// de la liste des méthodes d'attribution (changement de méthode de vote)
// des bulletins (changement de méthode de vote/attribution)
// des pourcentages et du diagramme sommaire

function actuateNbElecteurs() {
    const valeurCanonique = computeNbVotes();

    const input = document.getElementById("nbElecteurs");
    if (nbElecteurs === null) {
        // valeur non-manuelle, mise à la valeur canonique
        input.setAttribute("value", valeurCanonique);
    } else {
        // valeur manuelle, max entre la valeur actuelle et la valeur canonique
        // sans modifier la valeur manuelle enregistrée
        input.setAttribute("value", Math.max(nbElecteurs, valeurCanonique));
    }
}

// création du diagramme parliamentarch

// initialisation de l'interface
$(document).ready(function() {
    // remplissage de la liste des méthodes de vote
    const votingMethodContainer = document.getElementById("votingMethodContainer");
    for (const method of VotingMethods.values()) {
        const formCheck = votingMethodContainer.appendChild(document.createElement("div"));
        formCheck.className = "form-check";

        const input = formCheck.appendChild(document.createElement("input"));
        input.className = "form-check-input";
        input.type = "radio";
        input.name = "votingMethod";
        input.value = method;
        input.id = `votingMethod_${method}`;
        input.onclick = () => {
            votingMethod = method;
        };

        const label = formCheck.appendChild(document.createElement("label"));
        label.className = "form-check-label";
        label.htmlFor = input.id;
        label.textContent = method;
    }
});

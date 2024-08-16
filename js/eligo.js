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
// des bulletins (changement de méthode de vote/attributions)
// des pourcentages et du diagramme sommaire

function actuateNbElecteurs() {
    const valeurCanonique = computeNbVotes();

    const jinput = $("#nbElecteurs");
    if (nbElecteurs === null) {
        // valeur non-manuelle, mise à la valeur canonique
        jinput.val(valeurCanonique);
    } else {
        // valeur manuelle, max entre la valeur actuelle et la valeur canonique
        // sans modifier la valeur manuelle enregistrée
        jinput.val(Math.max(nbElecteurs, valeurCanonique));
    }
}

// création du diagramme parliamentarch

// application initiale des actions du clic aux boutons du formulaire
$(document).ready(function() {
});

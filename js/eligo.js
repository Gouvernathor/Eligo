import { VotingMethods } from "./eligo/constants.js";
// import { Candidat, Bulletin, BulletinSimple, BulletinApprobation, BulletinClassement, BulletinNotes } from "./eligo/classes.js";
import { newRandomValue, sortMap } from "./eligo/utils.js";


// définition des données : candidats, bulletins, votes

let votingMethod = null; // valeurs de votingMethods
let attributionMethod = null;
const candidats = new Map(); // candidat id -> Candidat
const bulletins = new Map(); // bulletin id -> Bulletin
const votes = new Map(); // bulletin id -> nombre de votes


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
/**
 * calcul du nombre d'électeurs (pour le calcul de l'abstention notamment)
 * @param {number} nbVotes si déjà calculé
 */
function computeNbElecteurs(nbVotes = null) {
    if (nbVotes === null)
        nbVotes = computeNbVotes();
    return Math.max(nbVotes, document.getElementById("nbElecteursManuel").value || 0);
}


// application des actions de clic aux boutons du formulaire


// application des ordres du formulaire aux données

// l'enregistrement de nbElecteurs est suivi d'un actuateNbElecteurs


// actualisation de données

// de la liste des méthodes d'attribution (changement de méthode de vote)
// des bulletins (changement de méthode de vote/attribution, changement de candidats)
function actuateBulletins() {
    switch (votingMethod) {
        case null:
            break;

        case VotingMethods.UNIQUE:
            const bulletinByCandidatId = new Map(
                Array.from(bulletins.values())
                    .filter(b => b.kind === VotingMethods.UNIQUE)
                    .map(b => [b.candidatId, b]));

            // nettoyage des bulletins obsolètes
            for (const [cid, b] of bulletinByCandidatId.entries()) {
                if (!candidats.has(cid)) {
                    bulletins.delete(b.id);
                    bulletinByCandidatId.delete(cid);
                }
            }
            // création des bulletins manquants
            for (const cid of candidats.keys()) {
                if (!bulletinByCandidatId.has(cid)) {
                    const bid = newRandomValue(Array.from(bulletins.keys()));
                    const bulletin = new BulletinSimple(bid, cid);
                    bulletins.set(bid, bulletin);
                    bulletinByCandidatId.set(cid, bulletin);
                }
            }
            // ordre des bulletins suivant l'ordre des candidats
            sortMap(bulletins, [...candidats.keys()].map(cid => bulletinByCandidatId.get(cid).id));

            // rendre invisible le bouton de formulaire de bulletins
            $("#bulletinFormButton").hide();

            break;

        case VotingMethods.APPROBATION:
        case VotingMethods.CLASSEMENT:
        case VotingMethods.NOTES:
            const bulletinsConcernes = Array.from(bulletins.values())
                .filter(b => b.kind === votingMethod);

            // nettoyage des bulletins obsolètes
            const candidateIdsIterator = votingMethod === VotingMethods.NOTES ?
                b => b.notes.keys() :
                b => b.candidatIds;
            for (const bulletin of bulletinsConcernes) {
                // si y'a des candidats inconnus
                if ([...candidateIdsIterator(bulletin)].some(cid => !candidats.has(cid))) {
                    bulletins.delete(bulletin.id);
                    bulletinsConcernes.delete(bulletin);
                }
            }
            // pas de création de bulletins
            // pas d'ordre particulier des bulletins

            // rendre visible le bouton de formulaire de bulletins
            $("#bulletinFormButton").show();

            break;

        default:
            throw new Error(`Méthode de vote inconnue ou non implémentée : ${votingMethod}`);
    }

    actuateNbElecteurs();
}

// des pourcentages et du diagramme sommaire
// du nombre d'électeurs (changement de bulletins même indirect)
function actuateNbElecteurs() {
    const input = document.getElementById("nbElecteursManuel");
    const nbVotes = computeNbVotes();
    input.min = nbVotes;
    const nbElecteurs = computeNbElecteurs(nbVotes);
    input.value = nbElecteurs;
    // set du min aussi ? seulement ? à voir en fonction du résultat
}


// création du diagramme parliamentarch


// initialisation de l'interface
$(document).ready(function () {
    // remplissage de la liste des méthodes de vote
    const votingMethodContainer = document.getElementById("votingMethodContainer");
    for (const method of VotingMethods.values()) {
        const li = votingMethodContainer.appendChild(document.createElement("li"));
        li.className = "list-group-item";

        const input = li.appendChild(document.createElement("input"));
        input.className = "form-check-input me-1";
        input.type = "radio";
        input.name = "votingMethod";
        input.value = method.id;
        input.id = `votingMethod_${method.id}`;
        input.onclick = () => {
            votingMethod = method;
            actuateBulletins();
        };

        const label = li.appendChild(document.createElement("label"));
        label.className = "form-check-label stretched-link";
        label.htmlFor = input.id;
        label.textContent = method.desc;
    }
});

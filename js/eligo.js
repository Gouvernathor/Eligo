import { VotingMethods } from "./eligo/constants.js";
import { Candidat, Bulletin, BulletinSimple, BulletinApprobation, BulletinClassement, BulletinNotes } from "./eligo/classes.js";
import { newRandomValue, getRandomColor, sortMap } from "./eligo/utils.js";


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

function addCandidat() {
    const cid = newRandomValue(candidats.keys());
    const candidat = new Candidat(cid, "Nouveau parti", getRandomColor(), 0, "#000000");
    candidats.set(cid, candidat);

    // append a new card to the end
    const partycard = document.getElementById("candidatsContainer").appendChild(document.createElement("div"));
    partycard.className = "card mb-3";
    partycard.id = `candidatCard_${candidat.id}`;
    const partycardbody = partycard.appendChild(document.createElement("div"));
    partycardbody.className = "card-body";

    // ligne du nom et de la couleur principale
    const firstRow = partycardbody.appendChild(document.createElement("div"));
    firstRow.className = "row g-3 mb-3";

    // nom
    const nameCol = firstRow.appendChild(document.createElement("div"));
    nameCol.className = "col-auto";
    const nameDiv = nameCol.appendChild(document.createElement("div"));
    nameDiv.className = "form-floating";
    const nameInput = nameDiv.appendChild(document.createElement("input"));
    nameInput.type = "text";
    nameInput.className = "form-control";
    nameInput.id = `candidatName_${candidat.id}`;
    nameInput.value = candidat.name;
    nameInput.onchange = () => {
        candidat.name = nameInput.value;
        updateBulletinsDisplay();
    };
    const nameLabel = nameDiv.appendChild(document.createElement("label"));
    nameLabel.htmlFor = nameInput.id;
    nameLabel.textContent = "Nom du parti";

    // couleur principale
    const colorCol = firstRow.appendChild(document.createElement("div"));
    colorCol.className = "col-auto";
    const colorDiv = colorCol.appendChild(document.createElement("div"));
    colorDiv.className = "form-floating";
    const colorInput = colorDiv.appendChild(document.createElement("input"));
    colorInput.className = "form-control";
    colorInput.setAttribute("data-jscolor", "");
    colorInput.id = `candidatColor_${candidat.id}`;
    colorInput.value = candidat.color;
    colorInput.onchange = () => {
        candidat.color = colorInput.value;
        updateBulletinsDisplay();
    };
    const colorLabel = colorDiv.appendChild(document.createElement("label"));
    colorLabel.htmlFor = colorInput.id;
    colorLabel.textContent = "Couleur du parti";

    // ligne de la bordure
    const secondRow = partycardbody.appendChild(document.createElement("div"));
    secondRow.className = "row g-3 mb-3";

    // épaisseur de bordure
    const borderWidthCol = secondRow.appendChild(document.createElement("div"));
    borderWidthCol.className = "col-auto";
    const borderWidthDiv = borderWidthCol.appendChild(document.createElement("div"));
    borderWidthDiv.className = "form-floating";
    const borderWidthInput = borderWidthDiv.appendChild(document.createElement("input"));
    borderWidthInput.type = "number";
    borderWidthInput.className = "form-control";
    borderWidthInput.id = `candidatBorderWidth_${candidat.id}`;
    borderWidthInput.value = candidat.borderWidth;
    borderWidthInput.onchange = () => {
        candidat.borderWidth = borderWidthInput.value;
        updateBulletinsDisplay();
    };
    const borderWidthLabel = borderWidthDiv.appendChild(document.createElement("label"));
    borderWidthLabel.htmlFor = borderWidthInput.id;
    borderWidthLabel.textContent = "Épaisseur de la bordure";

    // couleur de bordure
    const borderColorCol = secondRow.appendChild(document.createElement("div"));
    borderColorCol.className = "col-auto";
    const borderColorDiv = borderColorCol.appendChild(document.createElement("div"));
    borderColorDiv.className = "form-floating";
    const borderColorInput = borderColorDiv.appendChild(document.createElement("input"));
    borderColorInput.className = "form-control";
    borderColorInput.setAttribute("data-jscolor", "");
    borderColorInput.id = `candidatBorderColor_${candidat.id}`;
    borderColorInput.value = candidat.borderColor;
    borderColorInput.onchange = () => {
        candidat.borderColor = borderColorInput.value;
        updateBulletinsDisplay();
    };
    const borderColorLabel = borderColorDiv.appendChild(document.createElement("label"));
    borderColorLabel.htmlFor = borderColorInput.id;
    borderColorLabel.textContent = "Couleur de la bordure";

    // bouton delete
    const deleteButton = partycardbody.appendChild(document.createElement("button"));
    deleteButton.type = "button";
    deleteButton.className = "btn btn-outline-danger d-inline-block";
    deleteButton.id = `deleteCandidat_${candidat.id}`;
    deleteButton.textContent = "Supprimer";
    deleteButton.onclick = () => {
        deleteCandidat(candidat.id);
    };

    jscolor.install(partycard);

    actuateBulletins();
}
function deleteCandidat(cid) {
    candidats.delete(cid);

    const partycardid = `candidatCard_${cid}`;
    // seek-and-destroy the candidatCard
    const candidatsContainer = document.getElementById("candidatsContainer");
    for (const partycard of candidatsContainer.childNodes) {
        if (partycard.id === partycardid) {
            candidatsContainer.removeChild(partycard);
            break;
        }
    }

    actuateBulletins();
}

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
                    votes.delete(b.id);
                    bulletinByCandidatId.delete(cid);
                }
            }
            // création des bulletins manquants
            for (const cid of candidats.keys()) {
                if (!bulletinByCandidatId.has(cid)) {
                    const bid = newRandomValue(bulletins.keys());
                    const bulletin = new BulletinSimple(bid, cid);
                    bulletins.set(bid, bulletin);
                    votes.set(bid, 1);
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
                    votes.delete(bulletin.id);
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
    updateBulletinsDisplay();
}
/**
 * actualisation de l'affichage des bulletins dans le DOM
 */
function updateBulletinsDisplay() {
    // TODO
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
    document.getElementById("addCandidatButton").onclick = addCandidat;

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

    // bulletinFormButton
});

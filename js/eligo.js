import { VotingMethods } from "./eligo/constants.js";
import { Candidat, Bulletin, BulletinSimple, BulletinApprobation, BulletinClassement, BulletinNotes } from "./eligo/classes.js";
import { newRandomValue, getRandomColor, sortMap, sum, generate_rainbow } from "./eligo/utils.js";


// définition des données : candidats, bulletins, votes

let votingMethod = null; // valeurs de votingMethods
let attributionMethod = null;
const candidats = new Map(); // candidat id -> Candidat
const bulletins = new Map(); // bulletin id -> Bulletin
const votes = new Map(); // bulletin id -> nombre de votes
let nbElecteursManuel = null; // dernière valeur choisie par l'utilisateur
let nNotes = 5; // nombre de notes pour la méthode de vote par notes


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
    return Math.max(nbVotes, nbElecteursManuel || 0);
}


// application des actions de clic aux boutons du formulaire
function toggleElecteursManuel() {
    const nbElecteursManuelInput = document.getElementById("nbElecteursManuel");
    const nbVotes = computeNbVotes();
    if (document.getElementById("toggleElecteursManuel").checked) {
        nbElecteursManuelInput.disabled = false;
        if (nbElecteursManuel === null)
            nbElecteursManuel = nbVotes;
        nbElecteursManuelInput.value = Math.max(nbElecteursManuel, nbVotes);
    } else {
        nbElecteursManuelInput.disabled = true;
        nbElecteursManuelInput.value = nbVotes;
        nbElecteursManuel = null;
    }
    updateBulletinsDisplay();
}
function changeNbElecteursManuel() {
    nbElecteursManuel = document.getElementById("nbElecteursManuel").value;
    updateBulletinsDisplay();
}
function resetModalBulletinForm() {
    // vidange du container
    const container = document.getElementById("bulletinFormInputContainer");
    while (container.hasChildNodes())
        container.removeChild(container.firstChild);

    switch (votingMethod) {
        case VotingMethods.UNIQUE:
            throw new Error("Impossible de créer des nouveaux bulletins pour le vote unique");

        case VotingMethods.APPROBATION:
            // checkbox pour chacun des candidats
            for (const candidat of candidats.values()) {
                const formcheck = container.appendChild(document.createElement("div"));
                formcheck.className = "form-check";

                const input = formcheck.appendChild(document.createElement("input"));
                input.className = "form-check-input modal-bulletin-form-input";
                input.type = "checkbox";
                input.id = `bulletinFormInput_${candidat.id}`;

                const label = formcheck.appendChild(document.createElement("label"));
                label.className = "form-check-label";
                label.htmlFor = input.id;
                label.textContent = candidat.name;
            }
            break;
        case VotingMethods.CLASSEMENT:
            // drag-and-drop pour ordonner les candidats
            throw new Error("TODO");
            break;
        case VotingMethods.NOTES:
            // input number pour l'intervalle de notes
            const labelNNotes = container.appendChild(document.createElement("label"));
            labelNNotes.htmlFor = "bulletinFormNGradesInput";
            labelNNotes.className = "form-label";
            labelNNotes.textContent = "Nombre de notes";
            const minNNotes = Math.max(1, ...Array.from(bulletins.values())
                .filter(b => b.kind === VotingMethods.NOTES)
                .flatMap(b => b.notes.values()));
            const inputNNotes = container.appendChild(document.createElement("input"));
            inputNNotes.id = "bulletinFormNGradesInput";
            inputNNotes.className = "form-control";
            inputNNotes.type = "number";
            inputNNotes.setAttribute("aria-describedby", "bulletinFormNGradesHelp");
            inputNNotes.min = minNNotes;
            inputNNotes.value = Math.max(minNNotes, nNotes);
            const helpNNotes = container.appendChild(document.createElement("div"));
            helpNNotes.id = "bulletinFormNGradesHelp";
            helpNNotes.className = "form-text";
            helpNNotes.textContent = "Ce nombre s'appliquera à tous les bulletins pendant le dépouillement, il ne peut pas être supérieur à la plus grande note déjà attribuée.";

            const ranges = [];
            // chaque update de l'input met à jour le max de chaque range
            inputNNotes.onchange = () => {
                for (const range of ranges) {
                    range.max = inputNNotes.value;
                    range.value = Math.min(range.value, inputNNotes.value);
                }
            };

            // range pour chaque candidat entre 0 et la valeur de l'input
            for (const candidat of candidats.values()) {
                const labelRange = container.appendChild(document.createElement("label"));
                labelRange.htmlFor = `bulletinFormInput_${candidat.id}`;
                labelRange.className = "form-label";
                labelRange.textContent = candidat.name;

                const range = container.appendChild(document.createElement("input"));
                range.id = labelRange.htmlFor;
                range.className = "form-range modal-bulletin-form-input";
                range.type = "range";
                range.min = 0;
                range.max = inputNNotes.value;
                range.value = 0;
                ranges.push(range);
                // chaque update d'un range met à jour le min de l'input
                range.onchange = () => {
                    inputNNotes.min = Math.max(minNNotes, ...ranges.map(r => r.value));
                };
            }
            break;

        default:
            throw new Error(`Méthode de vote inconnue ou non implémentée : ${votingMethod}`);
    }
}
function validerBulletinForm() {
    // construire le Bulletin correspondant, en fonction de votingMethod
    let bulletin = null;
    switch (votingMethod) {
        case VotingMethods.UNIQUE:
            throw new Error("Impossible de créer des nouveaux bulletins pour le vote unique");

        case VotingMethods.APPROBATION: {
            const inputs = document.getElementsByClassName("modal-bulletin-form-input");
            const candidatIds = new Set();
            for (const input of inputs)
                if (input.checked)
                    candidatIds.add(parseInt(input.id.split("_")[1]));

            if (![...bulletins.values()].some(b => b.kind === votingMethod && b.candidatIds.equals(candidatIds)))
                // aucun doublon détecté
                bulletin = new BulletinApprobation(newRandomValue(bulletins.keys()), candidatIds);
        }
            break;

        case VotingMethods.CLASSEMENT:
            throw new Error("TODO");
            break;

        case VotingMethods.NOTES: {
            const ranges = document.getElementsByClassName("modal-bulletin-form-input");
            const notes = new Map();
            for (const range of ranges)
                notes.set(parseInt(range.id.split("_")[1]), parseInt(range.value));

            if (![...bulletins.values()].some(b => b.kind === votingMethod && b.notes.equals(notes)))
                // aucun doublon détecté
                bulletin = new BulletinNotes(newRandomValue(bulletins.keys()), notes);
        }
            break;

        default:
            throw new Error(`Méthode de vote inconnue ou non implémentée : ${votingMethod}`);
    }

    // si un bulletin de bulletins.values() est égal, afficher une erreur
    if (bulletin === null)
        // TODO traiter de manière visible et normale pour l'utilisateur
        throw new Error("Un bulletin identique existe déjà");

    // sinon, si tout va bien, ajouter le bulletin à bulletins et votes
    bulletins.set(bulletin.id, bulletin);
    votes.set(bulletin.id, 0);

    // dans le cas de NOTES, mise à jour de nNotes (seulement si tout va bien)
    if (votingMethod === VotingMethods.NOTES) {
        nNotes = parseInt(document.getElementById("bulletinFormNGradesInput").value);
    }

    // dismiss du modal
    $("#bulletinFormModal").modal("hide");
}


// application des ordres du formulaire aux données

function addCandidat() {
    const cid = newRandomValue(candidats.keys());
    const candidat = new Candidat(cid, "", getRandomColor(), 0, "#000000");
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
    nameInput.placeholder = "Nom du parti";
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
    const bulletinsContainer = document.getElementById("bulletinsContainer");

    while (bulletinsContainer.hasChildNodes())
        bulletinsContainer.removeChild(bulletinsContainer.firstChild);

    if (votingMethod === null)
        return;

    const authorizeDelete = votingMethod !== VotingMethods.UNIQUE;
    const progressbase = Math.max(1, computeNbElecteurs()); // avoid division by zero
    for (const bulletin of bulletins.values()) {
        if (bulletin.kind !== votingMethod)
            continue;

        const percent = `${(votes.get(bulletin.id) / progressbase * 100).toFixed(2)}%`;
        // TODO mettre à jour le diagramme sommaire avec les pourcentages

        const bulletincard = bulletinsContainer.appendChild(document.createElement("div"));
        bulletincard.className = "card";
        bulletincard.id = `bulletinCard_${bulletin.id}`;
        bulletincard.style.display = "grid";

        const bulletinprogress = bulletincard.appendChild(document.createElement("div"));
        bulletinprogress.className = "progress h-auto stacked";

        const bulletinprogressbar = bulletinprogress.appendChild(document.createElement("div"));
        bulletinprogressbar.className = "progress-bar";
        bulletinprogressbar.style.width = percent;

        const bulletincardbody = bulletincard.appendChild(document.createElement("div"));
        bulletincardbody.className = "card-body stacked row gap-3";

        // TODO ajuster les col-x en fonction de la taille des éléments
        // p-ê donner une largeur fixe à certains éléments comme les boutons + et -

        const bulletincontentdiv = bulletincardbody.appendChild(document.createElement("div"));
        bulletincontentdiv.className = "col";
        const bulletincontent = bulletincontentdiv.appendChild(document.createElement("span"));
        bulletincontent.className = "text-bg-secondary rounded px-2 py-1";
        // texte rempli plus loin

        const bulletinpercentdiv = bulletincardbody.appendChild(document.createElement("div"));
        bulletinpercentdiv.className = "col-1 d-flex justify-content-end";
        const bulletinpercent = bulletinpercentdiv.appendChild(document.createElement("span"));
        bulletinpercent.className = "text-end text-bg-primary rounded px-2 py-1";
        bulletinpercent.innerText = percent;

        const bulletinminus = bulletincardbody.appendChild(document.createElement("button"));
        bulletinminus.className = "col-1 fw-bold btn btn-outline-warning";
        bulletinminus.innerText = "-";
        bulletinminus.disabled = votes.get(bulletin.id) <= 1;
        bulletinminus.onclick = () => {
            votes.set(bulletin.id, votes.get(bulletin.id) - 1);
            actuateNbElecteurs();
            updateBulletinsDisplay();
        };

        const bulletinplus = bulletincardbody.appendChild(document.createElement("button"));
        bulletinplus.className = "col-1 fw-bold btn btn-outline-success";
        bulletinplus.innerText = "+";
        bulletinplus.onclick = () => {
            votes.set(bulletin.id, votes.get(bulletin.id) + 1);
            actuateNbElecteurs();
            updateBulletinsDisplay();
        };

        if (authorizeDelete) {
            const bulletindelete = bulletincardbody.appendChild(document.createElement("button"));
            bulletindelete.className = "col-3 btn btn-outline-danger";
            bulletindelete.innerText = "Supprimer";
            bulletindelete.onclick = () => {
                bulletins.delete(bulletin.id);
                votes.delete(bulletin.id);
                actuateNbElecteurs();
                updateBulletinsDisplay();
            };
        }

        let progresscolor = null;
        switch (votingMethod) {
            case VotingMethods.UNIQUE: {
                const candidat = candidats.get(bulletin.candidatId);
                progresscolor = candidat.color;
                bulletincontent.innerText = candidat.name;
            }
                break;
            case VotingMethods.APPROBATION: {
                const candidats = Array.from(bulletin.candidatIds)
                    .map(cid => candidats.get(cid)).sort();

                if (candidats.length === 0) {
                    bulletincontent.innerText = "Aucun candidat (bulletin blanc)";
                } else {
                    if (candidats.length === 1) {
                        progresscolor = candidats[0].color;
                    }
                    bulletincontent.innerText = candidats.map(c => c.name).join(", ");
                }
            }
                break;
            case VotingMethods.CLASSEMENT: {
                const candidats = bulletin.candidatIds.map(cid => candidats.get(cid));

                if (candidats.length === 0) {
                    bulletincontent.innerText = "Aucun candidat (bulletin blanc)";
                } else {
                    if (candidats.length === 1) {
                        progresscolor = candidats[0].color;
                    }
                    bulletincontent.innerText = candidats.map(c => c.name).join(" > ");
                }
            }
                break;
            case VotingMethods.NOTES: {
                let text = [];
                for (const candidat of candidats.values()) {
                    const note = bulletin.notes.getOrDefault(candidat.id, 0);
                    text.push(`${candidat.name} : ${note}`);
                }
                bulletincontent.innerText = text.join(", ");
            }
                break;
            default:
                throw new Error(`Méthode de vote inconnue ou non implémentée : ${votingMethod}`);
        }
        if (progresscolor === null) {
            // couleur déterministe en fonction de l'id du bulletin
            progresscolor = getRandomColor(bulletin.id);
        }
        bulletinprogressbar.style.backgroundColor = progresscolor;
    }

    writeChartSommaire();
}

// du nombre d'électeurs (changement de votes même indirect)
function actuateNbElecteurs() {
    const input = document.getElementById("nbElecteursManuel");
    const nbVotes = computeNbVotes();
    input.min = nbVotes;
    const nbElecteurs = computeNbElecteurs(nbVotes);
    input.value = nbElecteurs;
    // TODO quand le nombre de votes diminue,
    // dans le cas où l'utilisateur ne l'aurait pas modifié lui-même,
    // il faudrait le diminuer automatiquement
}


// gestion du diagramme sommaire
function writeChartSommaire() {
    const container = document.getElementById("chartSommaireContainer");
    while (container.hasChildNodes())
        container.removeChild(container.firstChild);

    if (votingMethod === null)
        return;

    const canvas = container.appendChild(document.createElement("canvas"));
    canvas.id = "chartSommaire";
    canvas.width = "100%";
    canvas.height = "50";

    switch (votingMethod) {
        case VotingMethods.UNIQUE: {
            const labels = []; // noms des candidats dans l'ordre des candidats
            const data = []; // nombre de votes pour le bulletin de chaque candidat
            const backgroundColor = []; // couleurs des candidats dans l'ordre des candidats
            const borderWidth = []; // bordures des candidats dans l'ordre des candidats
            const borderColor = []; // couleurs des bordures des candidats dans l'ordre des candidats
            for (const candidat of candidats.values()) {
                labels.push(candidat.name);
                const bulletin = Array.from(bulletins.values())
                    .find(b => b.candidatId === candidat.id);
                data.push(votes.getOrDefault(bulletin.id, 0));
                backgroundColor.push(candidat.color);
                borderWidth.push(candidat.borderWidth);
                borderColor.push(candidat.borderColor);
            }
            // TODO if abstention, ajouter une zone transparente

            new Chart(canvas, {
                type: "pie",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Votes",
                        data: data,
                        backgroundColor: backgroundColor,
                        borderWidth: borderWidth,
                        borderColor: borderColor,
                    }],
                },
                options: {
                    animation: {
                        animateRotate: false,
                    },
                },
            });
        }
            break;

        case VotingMethods.APPROBATION: {
            const bulletinsApprobation = Array.from(bulletins.values())
                .filter(b => b.kind === VotingMethods.APPROBATION);
            const total = sum(bulletinsApprobation
                .map(b => votes.getOrDefault(b.id, 0)));

            const labels = []; // noms des candidats dans l'ordre des candidats
            const data = []; // nombre de votes pour le bulletin de chaque candidat
            const backgroundColor = []; // couleurs des candidats dans l'ordre des candidats
            const borderWidth = []; // bordures des candidats dans l'ordre des candidats
            const borderColor = []; // couleurs des bordures des candidats dans l'ordre des candidats
            for (const candidat of candidats.values()) {
                labels.push(candidat.name);
                data.push(sum(bulletinsApprobation
                    .filter(b => b.candidatIds.has(candidat.id))
                    .map(b => votes.getOrDefault(b.id, 0))));
                backgroundColor.push(candidat.color);
                borderWidth.push(candidat.borderWidth);
                borderColor.push(candidat.borderColor);
            }

            new Chart(canvas, {
                type: "polarArea",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Nombre d'approbations",
                        data: data,
                        backgroundColor: backgroundColor,
                        borderWidth: borderWidth,
                        borderColor: borderColor,
                    }],
                },
                options: {
                    animation: {
                        animateRotate: false,
                    },
                    scales: {
                        r: {
                            max: total,
                        },
                    },
                },
            });
        }
            break;

        case VotingMethods.NOTES: {
            const bulletinsNotes = Array.from(bulletins.values())
                .filter(b => b.kind === VotingMethods.NOTES);

            const labels = []; // noms des candidats dans l'ordre des candidats
            const datasets = []; // un par note, de manière cumulée

            const rainbowgen = generate_rainbow(nNotes);
            for (let note = 0; note < nNotes; note++) {
                const color = rainbowgen.next().value;
                datasets.push({
                    label: `Notes inférieures ou égales à ${note}`,
                    data: [],
                    fill: true,
                    backgroundColor: color,
                    borderWidth: 0,
                    pointBackgroundColor: color,
                    pointBorderColor: "#fff",
                    pointRadius: 5,
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: color,
                    pointHoverRadius: 7,
                });
            }

            for (const candidat of candidats.values()) {
                labels.push(candidat.name);
                for (let note = 0; note < nNotes; note++) {
                    let ofthisnote = 0;
                    for (const bulletin of bulletinsNotes) {
                        if (bulletin.notes.getOrDefault(candidat.id, 0) <= note)
                            ofthisnote += votes.getOrDefault(bulletin.id, 0);
                    }
                    datasets[note].data.push(ofthisnote);
                }
            }

            new Chart(canvas, {
                type: "radar",
                data: {
                    labels: labels,
                    datasets: datasets,
                },
                options: {
                    animation: {
                        animateRotate: false,
                    },
                    // elements: {
                    //     lines: {
                    //         tension: 1, // pour rendre les lignes moins droites
                    //     },
                    // },
                },
            });
        }
            break;

        default:
            throw new Error(`Méthode de vote inconnue ou non implémentée : ${votingMethod}`);
    }
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

    document.getElementById("nbElecteursManuel").onchange = changeNbElecteursManuel;
    document.getElementById("toggleElecteursManuel").onclick = toggleElecteursManuel;

    document.getElementById("bulletinFormButton").onclick = resetModalBulletinForm;
    document.getElementById("bulletinFormFinish").onclick = validerBulletinForm;
});

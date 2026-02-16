// =============================================================================
// SiteProof — Nederlandse vertalingen voor alle axe-core regels
// =============================================================================
// Dit bestand is de kern van het product. Elke beschrijving is geschreven voor
// een ondernemer die geen HTML kent. Geen jargon, geen technische termen zonder
// uitleg, altijd een concrete fix-suggestie.
//
// Plaats in: /src/lib/scanner/translations/nl.ts
// =============================================================================

export interface AxeRuleTranslation {
  /** Korte beschrijving van het probleem — max 1 zin */
  description: string;
  /** Waarom dit belangrijk is voor mensen met een beperking — 1-2 zinnen */
  helpText: string;
  /** Concrete fix-instructie met code-voorbeeld waar relevant */
  fixSuggestion: string;
  /** WCAG succescriteria die dit raakt */
  wcagCriteria: string[];
  /** WCAG niveau */
  wcagLevel: "A" | "AA" | "AAA";
}

export const axeTranslationsNL: Record<string, AxeRuleTranslation> = {

  // ===========================================================================
  // AFBEELDINGEN & ALT-TEKSTEN
  // ===========================================================================

  "image-alt": {
    description: "Afbeelding mist een tekstbeschrijving (alt-tekst)",
    helpText: "Blinde en slechtziende bezoekers gebruiken een screenreader die alt-teksten voorleest. Zonder alt-tekst weten zij niet wat er op de afbeelding staat.",
    fixSuggestion: "Voeg een alt-attribuut toe aan het <img> element. Beschrijf kort wat je ziet. Voorbeeld: <img src=\"foto.jpg\" alt=\"Team tijdens een vergadering\">. Is de afbeelding puur decoratief? Gebruik dan een leeg alt-attribuut: alt=\"\".",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  "input-image-alt": {
    description: "Invoerknop met afbeelding mist een alt-tekst",
    helpText: "Als een afbeelding als knop wordt gebruikt, moet er een beschrijving zijn die vertelt wat de knop doet. Zonder deze tekst weet een screenreader-gebruiker niet wat er gebeurt als ze erop klikken.",
    fixSuggestion: "Voeg een alt-attribuut toe dat beschrijft wat de knop doet. Voorbeeld: <input type=\"image\" src=\"zoek.png\" alt=\"Zoeken\">.",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  "area-alt": {
    description: "Klikbaar gebied in een image map mist een alt-tekst",
    helpText: "Image maps hebben klikbare gebieden. Elk klikbaar gebied moet een beschrijving hebben zodat screenreader-gebruikers weten waar de link naartoe gaat.",
    fixSuggestion: "Voeg een alt-attribuut toe aan elk <area> element. Voorbeeld: <area alt=\"Contactpagina\" href=\"/contact\">.",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  "object-alt": {
    description: "Ingebed object (plugin/media) mist een tekstalternatief",
    helpText: "Ingebedde objecten zoals Flash of andere plugins zijn niet toegankelijk voor screenreaders als er geen tekstalternatief is.",
    fixSuggestion: "Voeg beschrijvende tekst toe binnen het <object> element, of gebruik aria-label. Voorbeeld: <object data=\"video.swf\"><p>Uitlegvideo over onze diensten</p></object>.",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  "svg-img-alt": {
    description: "SVG-afbeelding mist een toegankelijke naam",
    helpText: "SVG-afbeeldingen met role=\"img\" moeten een beschrijving hebben. Zonder beschrijving zijn ze onzichtbaar voor screenreader-gebruikers.",
    fixSuggestion: "Voeg een <title> element toe binnen de SVG, of gebruik aria-label. Voorbeeld: <svg role=\"img\" aria-label=\"Grafiek van omzetgroei\">. Is de SVG decoratief? Gebruik aria-hidden=\"true\".",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  "role-img-alt": {
    description: "Element met role=\"img\" mist een toegankelijke naam",
    helpText: "Als een element de rol van afbeelding heeft, moet het ook een beschrijving hebben. Anders mist de screenreader-gebruiker de visuele informatie.",
    fixSuggestion: "Voeg aria-label of aria-labelledby toe. Voorbeeld: <div role=\"img\" aria-label=\"Bedrijfslogo\">.",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // KLEURCONTRAST
  // ===========================================================================

  "color-contrast": {
    description: "Te weinig kleurcontrast tussen tekst en achtergrond",
    helpText: "Mensen met slechtziendheid of kleurenblindheid kunnen tekst met te weinig contrast moeilijk of niet lezen. WCAG vereist minimaal 4.5:1 contrast voor normale tekst en 3:1 voor grote tekst.",
    fixSuggestion: "Pas de tekstkleur of achtergrondkleur aan. Gebruik een contrastchecker (webaim.org/resources/contrastchecker) om de juiste combinatie te vinden. Donkere tekst op lichte achtergrond werkt bijna altijd. Vermijd lichtgrijs op wit.",
    wcagCriteria: ["1.4.3"],
    wcagLevel: "AA",
  },

  "color-contrast-enhanced": {
    description: "Kleurcontrast voldoet niet aan het verhoogde niveau (AAA)",
    helpText: "Voor optimale leesbaarheid vereist WCAG AAA een contrastverhouding van 7:1 voor normale tekst en 4.5:1 voor grote tekst. Dit is strenger dan het minimum.",
    fixSuggestion: "Verhoog het contrast door donkerdere tekst of lichtere achtergrond te gebruiken. AAA-niveau biedt de beste leesbaarheid voor alle gebruikers.",
    wcagCriteria: ["1.4.6"],
    wcagLevel: "AAA",
  },

  "link-in-text-block": {
    description: "Link in tekst is alleen door kleur te onderscheiden",
    helpText: "Als links alleen door kleur van de omringende tekst te onderscheiden zijn, kunnen kleurenblinde bezoekers ze niet herkennen als link.",
    fixSuggestion: "Voeg een onderstreping toe aan links, of gebruik een andere visuele indicator naast kleur. CSS: a { text-decoration: underline; }.",
    wcagCriteria: ["1.4.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // FORMULIEREN & INVOERVELDEN
  // ===========================================================================

  "label": {
    description: "Formulierveld mist een label (beschrijving)",
    helpText: "Elk invoerveld moet een label hebben dat beschrijft wat er ingevuld moet worden. Zonder label weet een screenreader-gebruiker niet wat er van hen verwacht wordt.",
    fixSuggestion: "Voeg een <label> element toe gekoppeld aan het invoerveld. Voorbeeld: <label for=\"email\">E-mailadres</label> <input id=\"email\" type=\"email\">.",
    wcagCriteria: ["1.3.1", "4.1.2"],
    wcagLevel: "A",
  },

  "select-name": {
    description: "Dropdown-menu mist een toegankelijke naam",
    helpText: "Dropdown-menu's moeten een label hebben zodat screenreader-gebruikers weten welke keuze ze moeten maken.",
    fixSuggestion: "Voeg een <label> toe gekoppeld aan de select. Voorbeeld: <label for=\"land\">Land</label> <select id=\"land\">...</select>.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "input-button-name": {
    description: "Invoerknop mist een toegankelijke naam",
    helpText: "Knoppen in formulieren moeten beschrijven wat ze doen. Een knop zonder tekst is voor screenreader-gebruikers onbruikbaar.",
    fixSuggestion: "Voeg een value-attribuut toe. Voorbeeld: <input type=\"submit\" value=\"Verstuur formulier\">.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "button-name": {
    description: "Knop mist een toegankelijke naam",
    helpText: "Knoppen zonder tekst of label zijn voor screenreader-gebruikers onzichtbaar. Ze horen een klik, maar weten niet wat de knop doet.",
    fixSuggestion: "Voeg tekst toe in de <button>, of gebruik aria-label bij icoon-knoppen. Voorbeeld: <button aria-label=\"Menu openen\"><svg>...</svg></button>.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "autocomplete-valid": {
    description: "Autocomplete-attribuut heeft een ongeldige waarde",
    helpText: "Het autocomplete-attribuut helpt browsers en hulpmiddelen formuliervelden automatisch in te vullen. Een verkeerde waarde kan ervoor zorgen dat dit niet werkt.",
    fixSuggestion: "Gebruik geldige autocomplete-waarden: name, email, tel, street-address, postal-code, country. Voorbeeld: <input type=\"email\" autocomplete=\"email\">.",
    wcagCriteria: ["1.3.5"],
    wcagLevel: "AA",
  },

  "form-field-multiple-labels": {
    description: "Formulierveld heeft meerdere labels",
    helpText: "Als een invoerveld meerdere labels heeft, kan een screenreader in de war raken over welk label bij het veld hoort.",
    fixSuggestion: "Zorg dat elk formulierveld precies één label heeft. Verwijder overtollige labels of combineer ze tot één duidelijk label.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // KOPPEN (HEADINGS)
  // ===========================================================================

  "heading-order": {
    description: "Kopniveaus worden overgeslagen (bijvoorbeeld h1 → h3 zonder h2)",
    helpText: "Screenreader-gebruikers navigeren via koppen door een pagina. Als kopniveaus worden overgeslagen, raakt de structuur verwarrend en missen ze mogelijk inhoud.",
    fixSuggestion: "Zorg dat koppen in de juiste volgorde staan: h1 voor de hoofdtitel, h2 voor secties, h3 voor subsecties. Spring geen niveaus over. Denk aan het als een inhoudsopgave.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "page-has-heading-one": {
    description: "Pagina mist een hoofdkop (h1)",
    helpText: "Elke pagina moet één h1 hebben die het onderwerp beschrijft. Screenreader-gebruikers zoeken als eerste naar de h1 om te weten waar de pagina over gaat.",
    fixSuggestion: "Voeg een <h1> element toe bovenaan de pagina-inhoud. Voorbeeld: <h1>Onze diensten</h1>. Gebruik slechts één h1 per pagina.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "empty-heading": {
    description: "Kop is leeg (bevat geen tekst)",
    helpText: "Een lege kop verschijnt in de koppenlijst van een screenreader maar geeft geen informatie. Dit is verwarrend voor gebruikers die via koppen navigeren.",
    fixSuggestion: "Voeg tekst toe aan de kop, of verwijder het kop-element als het niet nodig is. Een kop moet altijd beschrijven wat er in die sectie staat.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // LINKS
  // ===========================================================================

  "link-name": {
    description: "Link mist een toegankelijke naam",
    helpText: "Links zonder tekst (bijvoorbeeld een link die alleen een icoon bevat) zijn voor screenreader-gebruikers onzichtbaar. Ze horen \"link\" maar weten niet waarheen.",
    fixSuggestion: "Voeg beschrijvende tekst toe aan de link, of gebruik aria-label. Voorbeeld: <a href=\"/contact\" aria-label=\"Ga naar contactpagina\"><svg>...</svg></a>. Vermijd \"klik hier\" als linktekst.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "identical-links-same-purpose": {
    description: "Links met dezelfde tekst gaan naar verschillende bestemmingen",
    helpText: "Als meerdere links dezelfde tekst hebben (bijvoorbeeld \"Lees meer\") maar naar verschillende pagina's gaan, is dat verwarrend voor screenreader-gebruikers die een lijst van alle links op de pagina bekijken.",
    fixSuggestion: "Maak linkteksten uniek en beschrijvend. In plaats van \"Lees meer\" gebruik \"Lees meer over onze diensten\" en \"Lees meer over onze tarieven\".",
    wcagCriteria: ["2.4.9"],
    wcagLevel: "AAA",
  },

  // ===========================================================================
  // ARIA
  // ===========================================================================

  "aria-allowed-attr": {
    description: "ARIA-attribuut is niet toegestaan op dit element",
    helpText: "ARIA-attributen helpen screenreaders om de functie van elementen te begrijpen. Een verkeerd ARIA-attribuut kan leiden tot verwarring of foutieve informatie.",
    fixSuggestion: "Verwijder het ongeoorloofde ARIA-attribuut, of vervang het door een attribuut dat wél is toegestaan op dit type element. Raadpleeg de WAI-ARIA specificatie voor welke attributen waar mogen.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-allowed-role": {
    description: "ARIA-rol is niet toegestaan op dit element",
    helpText: "Niet elke ARIA-rol mag op elk HTML-element worden gebruikt. Een verkeerde rol kan ervoor zorgen dat een screenreader het element verkeerd interpreteert.",
    fixSuggestion: "Verwijder de rol of gebruik een HTML-element dat van nature de juiste rol heeft. Bijvoorbeeld: gebruik <button> in plaats van <div role=\"button\">.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-command-name": {
    description: "ARIA-commando (knop/link/menu-item) mist een toegankelijke naam",
    helpText: "Elementen met een ARIA-commandorol moeten een naam hebben zodat screenreader-gebruikers weten wat het element doet.",
    fixSuggestion: "Voeg aria-label of zichtbare tekst toe aan het element. Voorbeeld: <div role=\"button\" aria-label=\"Sluiten\">×</div>.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-hidden-body": {
    description: "aria-hidden=\"true\" staat op het <body> element",
    helpText: "Als het body-element verborgen is voor screenreaders, is de hele pagina onzichtbaar voor blinde gebruikers. De pagina is dan volledig ontoegankelijk.",
    fixSuggestion: "Verwijder aria-hidden=\"true\" van het <body> element. Dit attribuut mag alleen op specifieke elementen staan die bewust verborgen moeten zijn (zoals decoratieve iconen).",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-hidden-focus": {
    description: "Element met aria-hidden=\"true\" kan nog steeds focus ontvangen",
    helpText: "Als een element verborgen is voor screenreaders maar nog steeds met het toetsenbord bereikbaar is, raakt de gebruiker een onzichtbaar element. Dit is zeer verwarrend.",
    fixSuggestion: "Voeg tabindex=\"-1\" toe aan het verborgen element, of verwijder aria-hidden=\"true\". Een element mag niet tegelijk verborgen én focusbaar zijn.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-input-field-name": {
    description: "ARIA-invoerveld mist een toegankelijke naam",
    helpText: "Invoervelden met ARIA-rollen (zoals combobox, listbox, searchbox) moeten een naam hebben zodat screenreader-gebruikers weten wat ze moeten invullen.",
    fixSuggestion: "Voeg aria-label of aria-labelledby toe. Voorbeeld: <div role=\"searchbox\" aria-label=\"Zoek producten\">.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-meter-name": {
    description: "Meter-element mist een toegankelijke naam",
    helpText: "Elementen met role=\"meter\" (voortgangsindicatoren, niveaumeters) moeten een naam hebben zodat screenreader-gebruikers weten wat er gemeten wordt.",
    fixSuggestion: "Voeg aria-label toe. Voorbeeld: <div role=\"meter\" aria-label=\"Wachtwoordsterkte\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"75\">.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-progressbar-name": {
    description: "Voortgangsbalk mist een toegankelijke naam",
    helpText: "Voortgangsbalken moeten een naam hebben zodat screenreader-gebruikers weten waarvoor de voortgang wordt getoond.",
    fixSuggestion: "Voeg aria-label toe. Voorbeeld: <div role=\"progressbar\" aria-label=\"Bestand uploaden\" aria-valuenow=\"60\">.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-required-attr": {
    description: "Verplicht ARIA-attribuut ontbreekt",
    helpText: "Sommige ARIA-rollen vereisen specifieke attributen om correct te werken. Zonder deze attributen kan een screenreader het element niet goed interpreteren.",
    fixSuggestion: "Voeg de ontbrekende verplichte ARIA-attributen toe. Bijvoorbeeld: een element met role=\"slider\" vereist aria-valuemin, aria-valuemax, en aria-valuenow.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-required-children": {
    description: "ARIA-element mist verplichte child-elementen",
    helpText: "Sommige ARIA-rollen vereisen specifieke child-elementen. Bijvoorbeeld: een element met role=\"list\" moet elementen met role=\"listitem\" bevatten.",
    fixSuggestion: "Voeg de vereiste child-elementen toe, of gebruik standaard HTML-elementen die deze structuur van nature hebben. Gebruik <ul> en <li> in plaats van role=\"list\" en role=\"listitem\".",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-required-parent": {
    description: "ARIA-element staat niet binnen het vereiste parent-element",
    helpText: "Sommige ARIA-rollen moeten binnen een specifiek parent-element staan. Bijvoorbeeld: role=\"listitem\" moet binnen role=\"list\" staan.",
    fixSuggestion: "Plaats het element binnen het juiste parent-element, of gebruik standaard HTML-elementen. Voorbeeld: <li> hoort binnen <ul> of <ol>.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-roles": {
    description: "ARIA-rol heeft een ongeldige waarde",
    helpText: "Een onbekende of verkeerd gespelde ARIA-rol wordt door screenreaders genegeerd, waardoor het element mogelijk verkeerd wordt geïnterpreteerd.",
    fixSuggestion: "Gebruik een geldige ARIA-rol. Veelgebruikte rollen: button, link, navigation, search, main, complementary, banner. Controleer de spelling.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-toggle-field-name": {
    description: "Schakelknop (toggle) mist een toegankelijke naam",
    helpText: "Elementen met een toggle-rol (checkbox, switch, menuitemcheckbox) moeten een naam hebben zodat screenreader-gebruikers weten wat ze aan- of uitzetten.",
    fixSuggestion: "Voeg aria-label of een gekoppeld label toe. Voorbeeld: <div role=\"switch\" aria-label=\"Donkere modus\" aria-checked=\"false\">.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-tooltip-name": {
    description: "Tooltip mist een toegankelijke naam",
    helpText: "Tooltips (role=\"tooltip\") moeten een naam hebben zodat screenreader-gebruikers de inhoud kunnen begrijpen.",
    fixSuggestion: "Zorg dat de tooltip zichtbare tekst bevat, of voeg aria-label toe.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-treeitem-name": {
    description: "Boomstructuur-item mist een toegankelijke naam",
    helpText: "Items in een boomstructuur (role=\"treeitem\") moeten een naam hebben zodat screenreader-gebruikers door de structuur kunnen navigeren.",
    fixSuggestion: "Voeg zichtbare tekst of aria-label toe aan elk treeitem.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-valid-attr": {
    description: "ARIA-attribuut is ongeldig of verkeerd gespeld",
    helpText: "Een ongeldig ARIA-attribuut wordt door de browser en screenreaders genegeerd, waardoor bedoelde toegankelijkheidsinformatie verloren gaat.",
    fixSuggestion: "Controleer de spelling van het ARIA-attribuut. Veelvoorkomende fout: aria-lable in plaats van aria-label.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-valid-attr-value": {
    description: "ARIA-attribuut heeft een ongeldige waarde",
    helpText: "ARIA-attributen verwachten specifieke waarden. Een ongeldige waarde kan ervoor zorgen dat screenreaders het element verkeerd interpreteren.",
    fixSuggestion: "Controleer welke waarden zijn toegestaan voor dit attribuut. Bijvoorbeeld: aria-expanded accepteert alleen \"true\" of \"false\", niet \"yes\" of \"no\".",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-dialog-name": {
    description: "Dialoogvenster (modal) mist een toegankelijke naam",
    helpText: "Als een dialoogvenster opent, moet een screenreader de titel voorlezen. Zonder naam weet de gebruiker niet wat het venster bevat.",
    fixSuggestion: "Voeg aria-label of aria-labelledby toe aan het element met role=\"dialog\". Voorbeeld: <div role=\"dialog\" aria-labelledby=\"modal-titel\"><h2 id=\"modal-titel\">Bevestiging</h2>...</div>.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "aria-text": {
    description: "Element met role=\"text\" bevat focusbare child-elementen",
    helpText: "Als role=\"text\" wordt gebruikt om tekst als één doorlopend blok voor te laten lezen, mogen er geen links of knoppen in zitten die apart focus moeten krijgen.",
    fixSuggestion: "Verwijder role=\"text\" als het element focusbare children bevat, of haal de focusbare elementen eruit.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // TAAL
  // ===========================================================================

  "html-has-lang": {
    description: "HTML-element mist een taalattribuut (lang)",
    helpText: "Het lang-attribuut vertelt screenreaders in welke taal de pagina is geschreven. Zonder dit attribuut kan de screenreader de tekst met de verkeerde uitspraak voorlezen.",
    fixSuggestion: "Voeg een lang-attribuut toe aan het <html> element. Voor Nederlandse websites: <html lang=\"nl\">. Voor Engelstalige: <html lang=\"en\">.",
    wcagCriteria: ["3.1.1"],
    wcagLevel: "A",
  },

  "html-lang-valid": {
    description: "Taalcode in het lang-attribuut is ongeldig",
    helpText: "Een ongeldige taalcode (zoals lang=\"dutch\" in plaats van lang=\"nl\") wordt door screenreaders niet herkend, waardoor de uitspraak mogelijk fout is.",
    fixSuggestion: "Gebruik een geldige BCP 47 taalcode. Nederlands: \"nl\". Engels: \"en\". Duits: \"de\". Frans: \"fr\". Belgisch Nederlands: \"nl-BE\".",
    wcagCriteria: ["3.1.1"],
    wcagLevel: "A",
  },

  "html-xml-lang-mismatch": {
    description: "Het lang-attribuut en xml:lang-attribuut komen niet overeen",
    helpText: "Als beide attributen aanwezig zijn maar verschillende talen aangeven, kan een screenreader in de war raken over welke taal te gebruiken.",
    fixSuggestion: "Zorg dat lang en xml:lang dezelfde taalcode bevatten: <html lang=\"nl\" xml:lang=\"nl\">.",
    wcagCriteria: ["3.1.1"],
    wcagLevel: "A",
  },

  "valid-lang": {
    description: "Taalattribuut op een element bevat een ongeldige taalcode",
    helpText: "Als een deel van de pagina in een andere taal is (bijvoorbeeld een Engels citaat op een Nederlandse pagina), moet het lang-attribuut een geldige code bevatten.",
    fixSuggestion: "Gebruik een geldige taalcode. Voorbeeld: <blockquote lang=\"en\">This is an English quote.</blockquote>.",
    wcagCriteria: ["3.1.2"],
    wcagLevel: "AA",
  },

  // ===========================================================================
  // TABELLEN
  // ===========================================================================

  "td-headers-attr": {
    description: "Tabelcel verwijst naar een niet-bestaande header",
    helpText: "Tabelcellen kunnen met het headers-attribuut verwijzen naar kopjescellen. Als deze verwijzing ongeldig is, kan een screenreader niet uitleggen bij welke kolom/rij de data hoort.",
    fixSuggestion: "Controleer dat de waarden in het headers-attribuut overeenkomen met de id's van <th> elementen. Voorbeeld: <th id=\"naam\">Naam</th> ... <td headers=\"naam\">Jan</td>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "th-has-data-cells": {
    description: "Tabelkop (<th>) heeft geen bijbehorende datacellen",
    helpText: "Een tabelkop die niet is gekoppeld aan datacellen is verwarrend voor screenreader-gebruikers, omdat de kop geen context biedt.",
    fixSuggestion: "Zorg dat elke <th> minstens één <td> in dezelfde kolom of rij heeft, of verwijder de overbodige kop.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "scope-attr-valid": {
    description: "Scope-attribuut op tabelkop heeft een ongeldige waarde",
    helpText: "Het scope-attribuut geeft aan of een tabelkop bij een kolom (col) of rij (row) hoort. Een ongeldige waarde maakt de tabel onleesbaar voor screenreaders.",
    fixSuggestion: "Gebruik geldige scope-waarden: col, row, colgroup, of rowgroup. Voorbeeld: <th scope=\"col\">Naam</th>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "table-duplicate-name": {
    description: "Tabel heeft dezelfde naam als het bijschrift (caption)",
    helpText: "Als de toegankelijke naam van een tabel identiek is aan het bijschrift, hoort een screenreader-gebruiker dezelfde tekst twee keer.",
    fixSuggestion: "Zorg dat de aria-label of aria-labelledby verschilt van de <caption> tekst, of verwijder het dubbele attribuut.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "table-fake-caption": {
    description: "Tabel gebruikt een cel in plaats van een bijschrift (<caption>)",
    helpText: "Als een tabel de titel in een tabelcel plaatst in plaats van in een <caption> element, mist de screenreader de relatie tussen de titel en de tabel.",
    fixSuggestion: "Vervang de titelcel door een <caption> element direct na de <table> tag. Voorbeeld: <table><caption>Overzicht medewerkers</caption>...</table>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // TOETSENBORD & NAVIGATIE
  // ===========================================================================

  "tabindex": {
    description: "Element heeft een tabindex groter dan 0",
    helpText: "Een tabindex hoger dan 0 verandert de tabvolgorde en maakt toetsenbordnavigatie onvoorspelbaar. Gebruikers verwachten dat ze door de pagina tabben in de visuele volgorde.",
    fixSuggestion: "Gebruik tabindex=\"0\" om een element focusbaar te maken in de normale volgorde, of tabindex=\"-1\" om het alleen via JavaScript focusbaar te maken. Vermijd tabindex=\"1\" of hoger.",
    wcagCriteria: ["2.4.3"],
    wcagLevel: "A",
  },

  "scrollable-region-focusable": {
    description: "Scrollbaar gebied is niet bereikbaar met het toetsenbord",
    helpText: "Als een deel van de pagina scrollbaar is (zoals een codeblok of kaart) maar niet met het toetsenbord bereikbaar, kunnen toetsenbordgebruikers die inhoud niet lezen.",
    fixSuggestion: "Voeg tabindex=\"0\" toe aan het scrollbare element, zodat het met Tab bereikbaar is. Voorbeeld: <div style=\"overflow: auto\" tabindex=\"0\">...</div>.",
    wcagCriteria: ["2.1.1"],
    wcagLevel: "A",
  },

  "accesskeys": {
    description: "Toegangstoets (accesskey) is niet uniek",
    helpText: "Toegangstoetsen zijn sneltoetsen om snel naar een element te navigeren. Als dezelfde toets meerdere keren wordt gebruikt, werkt alleen de eerste.",
    fixSuggestion: "Zorg dat elke accesskey uniek is op de pagina. Overweeg of accesskeys überhaupt nodig zijn — ze zijn verwarrend voor veel gebruikers.",
    wcagCriteria: ["4.1.1"],
    wcagLevel: "A",
  },

  "focus-order-semantics": {
    description: "Element in de focusvolgorde heeft geen interactieve rol",
    helpText: "Als een niet-interactief element (zoals tekst) in de focusvolgorde staat, is dat verwarrend voor toetsenbordgebruikers die verwachten dat ze alleen op knoppen en links landen.",
    fixSuggestion: "Verwijder tabindex van niet-interactieve elementen, of geef het element een passende interactieve rol.",
    wcagCriteria: ["2.4.3"],
    wcagLevel: "A",
  },

  "bypass": {
    description: "Pagina mist een manier om herhalende inhoud over te slaan",
    helpText: "Toetsenbordgebruikers en screenreader-gebruikers moeten bij elke pagina door het hele menu tabben om bij de inhoud te komen. Een skip-link lost dit op.",
    fixSuggestion: "Voeg een 'Ga naar inhoud' link toe bovenaan de pagina die naar de hoofdinhoud springt. Voorbeeld: <a href=\"#content\" class=\"skip-link\">Ga naar inhoud</a> ... <main id=\"content\">.",
    wcagCriteria: ["2.4.1"],
    wcagLevel: "A",
  },

  "nested-interactive": {
    description: "Interactief element zit binnen een ander interactief element",
    helpText: "Een knop binnen een link, of een link binnen een knop, is onvoorspelbaar voor screenreaders en toetsenbordgebruikers. Het is onduidelijk welke actie wordt uitgevoerd.",
    fixSuggestion: "Haal het geneste interactieve element eruit. Een <button> hoort niet in een <a> en andersom. Kies één van de twee.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // DOCUMENT & PAGINA STRUCTUUR
  // ===========================================================================

  "document-title": {
    description: "Pagina mist een titel (<title>)",
    helpText: "De paginatitel verschijnt in het browsertabblad en is het eerste wat een screenreader voorleest. Zonder titel weet een gebruiker niet op welke pagina ze zijn.",
    fixSuggestion: "Voeg een <title> element toe in de <head> van de pagina. Voorbeeld: <title>Contact — SiteProof</title>. Elke pagina moet een unieke, beschrijvende titel hebben.",
    wcagCriteria: ["2.4.2"],
    wcagLevel: "A",
  },

  "meta-viewport": {
    description: "Meta viewport voorkomt dat gebruikers kunnen inzoomen",
    helpText: "Sommige websites blokkeren het inzoomen op mobiele apparaten. Dit is een groot probleem voor slechtziende gebruikers die moeten inzoomen om tekst te lezen.",
    fixSuggestion: "Verwijder maximum-scale=1 en user-scalable=no uit de meta viewport tag. Correct: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
    wcagCriteria: ["1.4.4"],
    wcagLevel: "AA",
  },

  "meta-refresh": {
    description: "Pagina gebruikt een automatische redirect via meta refresh",
    helpText: "Automatische redirects zijn verwarrend voor screenreader-gebruikers. De pagina verandert plotseling zonder waarschuwing, en de gebruiker kan de timing niet aanpassen.",
    fixSuggestion: "Gebruik een server-side redirect (301/302) in plaats van <meta http-equiv=\"refresh\">. Als een tijdvertraging nodig is, informeer de gebruiker en geef een link om handmatig door te klikken.",
    wcagCriteria: ["2.2.1", "3.2.5"],
    wcagLevel: "A",
  },

  "region": {
    description: "Pagina-inhoud staat niet in een landmarkgebied",
    helpText: "Landmarks (zoals <main>, <nav>, <header>, <footer>) helpen screenreader-gebruikers snel naar het juiste deel van de pagina te navigeren. Inhoud buiten landmarks is moeilijker te vinden.",
    fixSuggestion: "Zorg dat alle zichtbare inhoud in semantische HTML-elementen staat: <header> voor de bovenste balk, <nav> voor navigatie, <main> voor de hoofdinhoud, <footer> voor onderaan. Voorbeeld: <main>Hier de pagina-inhoud</main>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-banner-is-top-level": {
    description: "Banner-landmark (<header>) is genest in een ander landmark",
    helpText: "De <header> van de pagina moet op het hoogste niveau staan, niet binnen een ander landmark-element. Anders kan een screenreader de structuur niet goed interpreteren.",
    fixSuggestion: "Verplaats het <header> element naar het hoogste niveau van de pagina, direct als child van <body>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-contentinfo-is-top-level": {
    description: "Footer-landmark is genest in een ander landmark",
    helpText: "De <footer> van de pagina moet op het hoogste niveau staan zodat screenreaders deze correct herkennen.",
    fixSuggestion: "Verplaats het <footer> element naar het hoogste niveau van de pagina, direct als child van <body>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-main-is-top-level": {
    description: "Main-landmark is genest in een ander landmark",
    helpText: "Het <main> element moet op het hoogste niveau staan zodat screenreaders er direct naartoe kunnen navigeren.",
    fixSuggestion: "Verplaats <main> naar het hoogste niveau, direct als child van <body>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-no-duplicate-banner": {
    description: "Pagina heeft meerdere banner-landmarks (<header>)",
    helpText: "Een pagina mag maar één <header> op het hoogste niveau hebben. Meerdere headers verwarren screenreader-gebruikers over welke de echte paginakop is.",
    fixSuggestion: "Zorg voor maximaal één <header> op het hoogste niveau. Gebruik binnen secties een geneste <header> alleen als dat semantisch klopt.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-no-duplicate-contentinfo": {
    description: "Pagina heeft meerdere footer-landmarks",
    helpText: "Een pagina mag maar één <footer> op het hoogste niveau hebben.",
    fixSuggestion: "Zorg voor maximaal één <footer> op het hoogste niveau.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-no-duplicate-main": {
    description: "Pagina heeft meerdere main-landmarks",
    helpText: "Een pagina mag maar één <main> element hebben. Meerdere main-landmarks maken het onduidelijk waar de hoofdinhoud begint.",
    fixSuggestion: "Zorg voor precies één <main> element per pagina.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-one-main": {
    description: "Pagina mist een main-landmark",
    helpText: "Het <main> element markeert de hoofdinhoud van de pagina. Zonder <main> kunnen screenreader-gebruikers niet snel naar de inhoud navigeren.",
    fixSuggestion: "Wikkel de hoofdinhoud van de pagina in een <main> element. Voorbeeld: <main>...pagina-inhoud...</main>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "landmark-unique": {
    description: "Landmarks van hetzelfde type hebben geen unieke naam",
    helpText: "Als een pagina meerdere <nav> elementen heeft, moeten ze elk een unieke naam krijgen. Anders kan een screenreader-gebruiker niet kiezen tussen \"navigatie\" en \"navigatie\".",
    fixSuggestion: "Voeg aria-label toe aan elk landmark van hetzelfde type. Voorbeeld: <nav aria-label=\"Hoofdmenu\"> en <nav aria-label=\"Footerlinks\">.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // VIDEO, AUDIO & MEDIA
  // ===========================================================================

  "video-caption": {
    description: "Video mist ondertiteling",
    helpText: "Dove en slechthorende bezoekers zijn afhankelijk van ondertiteling om video-inhoud te begrijpen. Zonder ondertitels missen zij de gesproken informatie.",
    fixSuggestion: "Voeg ondertiteling toe aan de video via een <track> element met kind=\"captions\". Voorbeeld: <video><track kind=\"captions\" src=\"ondertitels.vtt\" srclang=\"nl\" label=\"Nederlands\"></video>.",
    wcagCriteria: ["1.2.2"],
    wcagLevel: "A",
  },

  "audio-caption": {
    description: "Audio-element mist ondertiteling of transcript",
    helpText: "Dove en slechthorende bezoekers hebben een tekstalternatief nodig voor audio-inhoud. Zonder transcript missen zij alle gesproken informatie.",
    fixSuggestion: "Voeg een transcript toe onder de audiospeler, of bied ondertiteling aan. Een transcript is een volledige tekstversie van alles wat wordt gezegd.",
    wcagCriteria: ["1.2.1"],
    wcagLevel: "A",
  },

  "video-description": {
    description: "Video mist een audiodescriptie",
    helpText: "Blinde gebruikers missen visuele informatie in video's die niet in het geluid wordt beschreven. Een audiodescriptie vertelt wat er te zien is.",
    fixSuggestion: "Voeg een audiodescriptie-track toe, of bied een versie van de video met ingebouwde beschrijvingen. Alternatief: voeg een teksttranscript toe dat zowel dialoog als visuele informatie beschrijft.",
    wcagCriteria: ["1.2.5"],
    wcagLevel: "AA",
  },

  // ===========================================================================
  // FRAMES & IFRAMES
  // ===========================================================================

  "frame-title": {
    description: "Frame of iframe mist een titel",
    helpText: "Frames worden door screenreaders aangekondigd met hun titel. Zonder titel hoort een gebruiker alleen \"frame\" en weet niet wat erin staat.",
    fixSuggestion: "Voeg een title-attribuut toe aan het <iframe> element. Voorbeeld: <iframe src=\"kaart.html\" title=\"Google Maps locatie van ons kantoor\">.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "frame-tested": {
    description: "Frame-inhoud kon niet worden getest",
    helpText: "De inhoud binnen dit frame kon niet worden gescand. Er kunnen toegankelijkheidsproblemen in zitten die niet zijn gedetecteerd.",
    fixSuggestion: "Test de inhoud van het frame apart. Open de URL van het frame direct en scan die pagina afzonderlijk.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "frame-focusable-content": {
    description: "Frame met tabindex=\"-1\" bevat focusbare inhoud",
    helpText: "Als een frame niet focusbaar is maar wel interactieve inhoud bevat, kunnen toetsenbordgebruikers die inhoud niet bereiken.",
    fixSuggestion: "Verwijder tabindex=\"-1\" van het frame, of zorg dat de inhoud op een andere manier bereikbaar is.",
    wcagCriteria: ["2.1.1"],
    wcagLevel: "A",
  },

  "frame-title-unique": {
    description: "Frames hebben geen unieke titels",
    helpText: "Als meerdere frames dezelfde titel hebben, kan een screenreader-gebruiker niet kiezen tussen ze.",
    fixSuggestion: "Geef elk frame een unieke, beschrijvende titel.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // LIJSTEN
  // ===========================================================================

  "list": {
    description: "Lijst is niet correct opgebouwd",
    helpText: "Lijsten (<ul> en <ol>) mogen alleen <li> elementen als directe kinderen bevatten. Een verkeerde structuur zorgt ervoor dat screenreaders de lijst niet goed kunnen voorlezen.",
    fixSuggestion: "Zorg dat <ul> en <ol> alleen <li> elementen direct bevatten. Andere inhoud moet binnen een <li> staan.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "listitem": {
    description: "Lijstitem (<li>) staat niet binnen een lijst",
    helpText: "Een <li> element hoort altijd binnen een <ul>, <ol>, of <menu> te staan. Los van een lijst wordt het niet als lijstitem herkend door screenreaders.",
    fixSuggestion: "Plaats het <li> element binnen een <ul> of <ol>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "definition-list": {
    description: "Definitielijst (<dl>) is niet correct opgebouwd",
    helpText: "Definitielijsten moeten bestaan uit term-definitie paren (<dt> en <dd>). Een verkeerde structuur maakt de lijst onleesbaar voor screenreaders.",
    fixSuggestion: "Zorg dat <dl> alleen <dt> (term) en <dd> (definitie) elementen bevat, eventueel gegroepeerd in <div>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "dlitem": {
    description: "Definitie-item staat niet binnen een definitielijst",
    helpText: "De elementen <dt> en <dd> horen altijd binnen een <dl> te staan.",
    fixSuggestion: "Plaats <dt> en <dd> elementen binnen een <dl> element.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // DUPLICATE & UNIEKE ELEMENTEN
  // ===========================================================================

  "duplicate-id-active": {
    description: "Actief element heeft een dubbel ID",
    helpText: "Als meerdere interactieve elementen (knoppen, invoervelden) hetzelfde ID hebben, kan een screenreader ze niet onderscheiden. Labels en ARIA-verwijzingen werken alleen voor het eerste element.",
    fixSuggestion: "Geef elk element een uniek ID. Controleer of IDs niet herhaald worden, vooral bij dynamisch gegenereerde formulieren.",
    wcagCriteria: ["4.1.1"],
    wcagLevel: "A",
  },

  "duplicate-id-aria": {
    description: "ID gebruikt in ARIA-verwijzing is niet uniek",
    helpText: "Als een ID dat in aria-labelledby of aria-describedby wordt gebruikt meerdere keren voorkomt, kan de screenreader naar het verkeerde element verwijzen.",
    fixSuggestion: "Zorg dat elk ID dat in ARIA-verwijzingen wordt gebruikt uniek is op de pagina.",
    wcagCriteria: ["4.1.1"],
    wcagLevel: "A",
  },

  "duplicate-id": {
    description: "Meerdere elementen hebben hetzelfde ID",
    helpText: "IDs moeten uniek zijn op een pagina. Dubbele IDs kunnen problemen veroorzaken met formulierlabels, ARIA-verwijzingen, en JavaScript-functionaliteit.",
    fixSuggestion: "Geef elk element een uniek ID. Zoek naar de dubbele ID en hernoem een van de twee.",
    wcagCriteria: ["4.1.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // PARSING & MARKUP
  // ===========================================================================

  "marquee": {
    description: "Pagina bevat een <marquee> element (scrollende tekst)",
    helpText: "Scrollende tekst is moeilijk leesbaar voor mensen met leesproblemen of cognitieve beperkingen, en kan niet worden gepauzeerd.",
    fixSuggestion: "Verwijder het <marquee> element. Gebruik statische tekst of een animatie die de gebruiker kan pauzeren.",
    wcagCriteria: ["2.2.2"],
    wcagLevel: "A",
  },

  "blink": {
    description: "Pagina bevat een <blink> element (knipperende tekst)",
    helpText: "Knipperende inhoud kan epileptische aanvallen veroorzaken en is zeer afleidend voor mensen met concentratieproblemen.",
    fixSuggestion: "Verwijder het <blink> element volledig. Knipperende tekst is nooit toegankelijk.",
    wcagCriteria: ["2.2.2"],
    wcagLevel: "A",
  },

  "server-side-image-map": {
    description: "Server-side image map gevonden",
    helpText: "Server-side image maps zijn niet toegankelijk voor toetsenbord- en screenreader-gebruikers. De klikbare gebieden hebben geen tekstalternatief.",
    fixSuggestion: "Vervang de server-side image map door een client-side image map (<map> met <area> elementen), of gebruik aparte links met beschrijvende tekst.",
    wcagCriteria: ["2.1.1"],
    wcagLevel: "A",
  },

  // ===========================================================================
  // SPECIFIEKE COMPONENT-ROLLEN
  // ===========================================================================

  "image-redundant-alt": {
    description: "Alt-tekst van afbeelding herhaalt omringende tekst",
    helpText: "Als de alt-tekst van een afbeelding hetzelfde zegt als de tekst ernaast, hoort een screenreader-gebruiker alles dubbel. Dat is irritant en vertragend.",
    fixSuggestion: "Maak de alt-tekst leeg (alt=\"\") als de omringende tekst de afbeelding al beschrijft, of maak de alt-tekst aanvullend in plaats van herhalend.",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  "label-title-only": {
    description: "Formulierveld gebruikt alleen een title-attribuut als label",
    helpText: "Het title-attribuut wordt pas getoond als je met de muis over het veld zweeft. Screenreaders lezen het soms wel voor, maar het is minder betrouwbaar dan een echt label.",
    fixSuggestion: "Voeg een zichtbaar <label> element toe. Het title-attribuut kan aanvullende uitleg geven, maar mag niet de enige labeling zijn.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "label-content-name-mismatch": {
    description: "Zichtbare tekst komt niet overeen met de toegankelijke naam",
    helpText: "Als de zichtbare tekst op een knop \"Verstuur\" is maar de aria-label \"Send form\" zegt, werkt spraakbediening niet. Een gebruiker die zegt \"klik Verstuur\" vindt de knop niet.",
    fixSuggestion: "Zorg dat de toegankelijke naam (aria-label) begint met of gelijk is aan de zichtbare tekst. Als de knop \"Verstuur\" toont, gebruik dan aria-label=\"Verstuur formulier\" (niet een compleet andere tekst).",
    wcagCriteria: ["2.5.3"],
    wcagLevel: "A",
  },

  "target-size": {
    description: "Klikbaar element is te klein (minimaal 24x24 pixels)",
    helpText: "Kleine knoppen en links zijn moeilijk te raken voor mensen met motorische beperkingen of op een touchscreen. WCAG 2.2 vereist minimaal 24x24 pixels.",
    fixSuggestion: "Maak het klikbare gebied groter. Gebruik padding om het klikgebied te vergroten zonder het ontwerp te veranderen. CSS: button { min-width: 44px; min-height: 44px; }.",
    wcagCriteria: ["2.5.8"],
    wcagLevel: "AA",
  },

  "p-as-heading": {
    description: "Paragraaf wordt visueel als kop gestyled maar is geen heading-element",
    helpText: "Als tekst er uitziet als een kop (groot, vetgedrukt) maar geen <h1>-<h6> element is, mist een screenreader-gebruiker de structuur. Ze zien de kop niet in hun koppenlijst.",
    fixSuggestion: "Vervang de gestylede <p> door het juiste heading-element. Voorbeeld: verander <p class=\"title\">Over ons</p> naar <h2>Over ons</h2>.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "presentation-role-conflict": {
    description: "Element met role=\"presentation\" of role=\"none\" heeft conflicterende attributen",
    helpText: "Als een element als decoratief is gemarkeerd (role=\"none\") maar tegelijk ARIA-attributen of focusmogelijkheden heeft, ontstaat er een conflict dat screenreaders in de war brengt.",
    fixSuggestion: "Verwijder de conflicterende ARIA-attributen en tabindex, of verwijder role=\"presentation\"/role=\"none\" als het element wél betekenis heeft.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "summary-name": {
    description: "Samenvatting-element (<summary>) mist toegankelijke inhoud",
    helpText: "Het <summary> element is de klikbare kop van een uitklapbare sectie (<details>). Zonder tekst weet een screenreader-gebruiker niet wat er uitgeklapt kan worden.",
    fixSuggestion: "Voeg beschrijvende tekst toe aan het <summary> element. Voorbeeld: <details><summary>Meer informatie over verzending</summary>...</details>.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "select-has-accessible-name": {
    description: "Selectieveld (<select>) mist een toegankelijke naam",
    helpText: "Als een selectieveld geen label heeft, weet een screenreader-gebruiker niet welke keuze ze moeten maken.",
    fixSuggestion: "Voeg een <label> element toe dat gekoppeld is via het for-attribuut. Voorbeeld: <label for=\"maat\">Selecteer maat</label> <select id=\"maat\">...</select>.",
    wcagCriteria: ["4.1.2"],
    wcagLevel: "A",
  },

  "empty-table-header": {
    description: "Tabelkop (<th>) is leeg",
    helpText: "Een lege tabelkop biedt geen context voor screenreader-gebruikers. Ze horen \"kolomkop: leeg\" wat geen informatie geeft.",
    fixSuggestion: "Voeg beschrijvende tekst toe aan de <th>, of gebruik aria-label als de kop visueel leeg moet blijven.",
    wcagCriteria: ["1.3.1"],
    wcagLevel: "A",
  },

  "meta-viewport-large": {
    description: "Meta viewport limiteert het maximale zoomniveau",
    helpText: "Een maximum-scale waarde beperkt hoever gebruikers kunnen inzoomen. Slechtziende gebruikers hebben vaak meer dan 200% zoom nodig.",
    fixSuggestion: "Verwijder maximum-scale uit de viewport meta tag, of stel het in op minstens 5. Correct: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
    wcagCriteria: ["1.4.4"],
    wcagLevel: "AA",
  },

  "no-autoplay-audio": {
    description: "Audio speelt automatisch af bij het laden van de pagina",
    helpText: "Automatisch afspelende audio is zeer storend voor screenreader-gebruikers, omdat het door de spraak van hun screenreader heen praat. Ze kunnen de pagina niet meer gebruiken.",
    fixSuggestion: "Verwijder autoplay van audio- en video-elementen, of zorg dat de audio gedempt begint en maximaal 3 seconden duurt. Laat gebruikers zelf kiezen wanneer ze audio afspelen.",
    wcagCriteria: ["1.4.2"],
    wcagLevel: "A",
  },

  "image-alt-length": {
    description: "Alt-tekst is ongewoon lang",
    helpText: "Een zeer lange alt-tekst (meer dan 150 tekens) is vermoeiend om naar te luisteren voor screenreader-gebruikers. Alt-tekst moet bondig zijn.",
    fixSuggestion: "Verkort de alt-tekst tot een bondige beschrijving (maximaal 125 tekens). Als een langere uitleg nodig is, gebruik dan een figcaption of aria-describedby dat verwijst naar een apart tekstelement.",
    wcagCriteria: ["1.1.1"],
    wcagLevel: "A",
  },

  "skip-link": {
    description: "Skip-link ontbreekt of is niet het eerste focusbare element",
    helpText: "Een skip-link helpt toetsenbordgebruikers het menu over te slaan en direct naar de inhoud te gaan. Het moet het eerste element zijn dat focus ontvangt bij het tabben.",
    fixSuggestion: "Voeg een skip-link toe als eerste element in de <body>: <a href=\"#main\" class=\"skip-link\">Ga naar inhoud</a>. Maak het visueel verborgen maar zichtbaar bij focus.",
    wcagCriteria: ["2.4.1"],
    wcagLevel: "A",
  },

  "css-orientation-lock": {
    description: "Pagina werkt alleen in één schermoriëntatie (staand of liggend)",
    helpText: "Sommige gebruikers hebben hun apparaat gemonteerd in een vaste positie. Als de pagina maar in één oriëntatie werkt, kunnen zij de website niet gebruiken.",
    fixSuggestion: "Verwijder CSS-regels die de oriëntatie beperken. Gebruik geen transform: rotate() in combinatie met orientation media queries om de weergave te forceren.",
    wcagCriteria: ["1.3.4"],
    wcagLevel: "AA",
  },

  "avoid-inline-spacing": {
    description: "Inline style overschrijft gebruikersaanpassingen voor tekstafstand",
    helpText: "Gebruikers met dyslexie of leesproblemen passen soms de tekst- en regelafstand aan. Als inline styles dit blokkeren, kunnen zij de tekst niet lezen.",
    fixSuggestion: "Vermijd inline styles voor letter-spacing, word-spacing, en line-height. Gebruik CSS-klassen zodat gebruikers de waarden kunnen overschrijven met hun eigen stylesheets.",
    wcagCriteria: ["1.4.12"],
    wcagLevel: "AA",
  },

};

// =============================================================================
// Helper functie om vertaling op te halen met fallback
// =============================================================================

export function getTranslation(ruleId: string): AxeRuleTranslation {
  const translation = axeTranslationsNL[ruleId];

  if (translation) {
    return translation;
  }

  // Fallback voor onbekende regels — geeft een generieke melding
  return {
    description: `Toegankelijkheidsprobleem gevonden (${ruleId})`,
    helpText: "Dit element voldoet niet aan de WCAG-richtlijnen. Dit kan problemen opleveren voor bezoekers die afhankelijk zijn van hulpmiddelen zoals screenreaders, toetsenbordnavigatie of vergrotingssoftware.",
    fixSuggestion: `Zoek naar de regel "${ruleId}" in de WCAG-documentatie op w3.org/WAI/WCAG21/quickref voor specifieke informatie over dit probleem en hoe het op te lossen.`,
    wcagCriteria: [],
    wcagLevel: "A",
  };
}

// =============================================================================
// Severity mapping — vertaalt axe-core impact naar Nederlandse severity
// =============================================================================

export const severityLabelsNL = {
  critical: "Kritiek",
  serious: "Ernstig",
  moderate: "Matig",
  minor: "Licht",
} as const;

export const severityDescriptionsNL = {
  critical: "Dit probleem voorkomt dat bepaalde gebruikers de website kunnen gebruiken. Direct oplossen.",
  serious: "Dit probleem maakt het gebruik van de website significant moeilijker voor bepaalde gebruikers.",
  moderate: "Dit probleem veroorzaakt enige hinder voor gebruikers met een beperking.",
  minor: "Dit is een klein probleem dat de gebruikerservaring beperkt beïnvloedt, maar wel opgelost moet worden.",
} as const;

// =============================================================================
// WCAG Criteria beschrijvingen in het Nederlands
// =============================================================================

export const wcagCriteriaNL: Record<string, { title: string; description: string }> = {
  "1.1.1": {
    title: "Niet-tekstuele inhoud",
    description: "Alle niet-tekstuele inhoud (afbeeldingen, iconen, grafieken) moet een tekstalternatief hebben.",
  },
  "1.2.1": {
    title: "Alleen audio en alleen video (vooraf opgenomen)",
    description: "Vooraf opgenomen audio en video moeten een tekstalternatief hebben.",
  },
  "1.2.2": {
    title: "Ondertiteling (vooraf opgenomen)",
    description: "Vooraf opgenomen video met geluid moet ondertiteling hebben.",
  },
  "1.2.5": {
    title: "Audiodescriptie (vooraf opgenomen)",
    description: "Vooraf opgenomen video moet een audiodescriptie hebben van visuele informatie.",
  },
  "1.3.1": {
    title: "Info en relaties",
    description: "Informatie en relaties die visueel worden overgebracht, moeten ook in code beschikbaar zijn.",
  },
  "1.3.4": {
    title: "Oriëntatie",
    description: "Inhoud mag niet beperkt zijn tot één schermoriëntatie, tenzij essentieel.",
  },
  "1.3.5": {
    title: "Identificeer het doel van invoer",
    description: "Formuliervelden voor persoonlijke gegevens moeten programmatisch herkenbaar zijn.",
  },
  "1.4.1": {
    title: "Gebruik van kleur",
    description: "Kleur mag niet het enige visuele middel zijn om informatie over te brengen.",
  },
  "1.4.2": {
    title: "Geluidsbediening",
    description: "Audio die automatisch afspeelt moet gepauzeerd of gestopt kunnen worden.",
  },
  "1.4.3": {
    title: "Contrast (minimum)",
    description: "Tekst moet een contrastverhouding van minimaal 4.5:1 hebben ten opzichte van de achtergrond.",
  },
  "1.4.4": {
    title: "Herschalen van tekst",
    description: "Tekst moet tot 200% vergroot kunnen worden zonder verlies van inhoud of functionaliteit.",
  },
  "1.4.6": {
    title: "Contrast (verhoogd)",
    description: "Tekst moet een contrastverhouding van minimaal 7:1 hebben (AAA-niveau).",
  },
  "1.4.12": {
    title: "Tekstafstand",
    description: "Gebruikers moeten tekst- en regelafstand kunnen aanpassen zonder verlies van inhoud.",
  },
  "2.1.1": {
    title: "Toetsenbord",
    description: "Alle functionaliteit moet bedienbaar zijn met een toetsenbord.",
  },
  "2.2.1": {
    title: "Timing aanpasbaar",
    description: "Tijdslimieten moeten door de gebruiker aangepast kunnen worden.",
  },
  "2.2.2": {
    title: "Pauzeren, stoppen, verbergen",
    description: "Bewegende of automatisch bijwerkende inhoud moet gepauzeerd, gestopt of verborgen kunnen worden.",
  },
  "2.4.1": {
    title: "Blokken omzeilen",
    description: "Er moet een manier zijn om herhalende blokken inhoud over te slaan.",
  },
  "2.4.2": {
    title: "Paginatitel",
    description: "Elke pagina moet een beschrijvende titel hebben.",
  },
  "2.4.3": {
    title: "Focusvolgorde",
    description: "De focusvolgorde moet logisch en betekenisvol zijn.",
  },
  "2.4.9": {
    title: "Linkdoel (alleen link)",
    description: "Het doel van elke link moet duidelijk zijn uit de linktekst alleen (AAA).",
  },
  "2.5.3": {
    title: "Label in naam",
    description: "De toegankelijke naam van een element moet de zichtbare tekst bevatten.",
  },
  "2.5.8": {
    title: "Doelgrootte (minimum)",
    description: "Interactieve elementen moeten minimaal 24x24 pixels groot zijn.",
  },
  "3.1.1": {
    title: "Taal van de pagina",
    description: "De standaardtaal van de pagina moet in code zijn aangegeven.",
  },
  "3.1.2": {
    title: "Taal van onderdelen",
    description: "De taal van tekstonderdelen die afwijken van de paginataal moet zijn aangegeven.",
  },
  "3.2.5": {
    title: "Verandering op verzoek",
    description: "Contextveranderingen mogen alleen op verzoek van de gebruiker plaatsvinden.",
  },
  "4.1.1": {
    title: "Parsen",
    description: "Elementen moeten unieke IDs hebben en correct genest zijn.",
  },
  "4.1.2": {
    title: "Naam, rol, waarde",
    description: "Alle interface-elementen moeten een toegankelijke naam, rol en waarde hebben.",
  },
};

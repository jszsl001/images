/**
 * Created by vperrier on 07/11/2016.
 */
//NO 801
function AddMatRequest() {
    clic_on_button("request_database", 0, 0, userid);
    var accessDatabase = moduleVerify("request_database", 0, true);
    if (accessDatabase.valide) {
        // avant #6502 :  $("#AddMatModal").modal('show');
        //#6502 renvoyer vers le système d'ajout TSI :
        window.open('https://support.trace-software.com/Pages/Ticket/ticketCreation.aspx?typeId=2706614&qId=2868661', '_blank');
    }
}

// suite Remarque Patrick, on remet ici la fonction pour envoyer directement des fiches techniques via le formulaire dédié
function validateFormAddMat(file, email) {//NO 801 ajout du flag => meme fonction pour RealDATA et Demande d'ajout materiel
    var idMat = "0"; // correspond au formulaire d'ajout de matériel

    if ($("#formCompany" + idMat).val() == "") {
        alert(findText("The company is required"));
        return;
    }
    if ($("#formName" + idMat).val() == "") {
        alert(findText("The name is required.")); // on met en php car on va chercher dans le tableau "general" et non "online" !!!
        return;
    }
    if ($("#formFirstName" + idMat).val() == "") {
        alert(findText("The first name is required."));
        return;
    }
    if ($("#formAddress" + idMat).val() == "") {
        alert(findText("The address is required"));
        return;
    }
    if ($("#formPostalC" + idMat).val() == "") {
        alert(findText("The postal code is required"));
        return;
    }
    if ($("#formCity" + idMat).val() == "") {
        alert(findText("The city is required"));
        return;
    }
    if ($("#formCountry" + idMat).val() == "") {
        alert(findText("The country is required"));
        return;
    }
    if ($("#formTel" + idMat).val() == "") {
        alert(findText("The phonenumber is required."));
        return;
    }
    if ($("#formEmail" + idMat).val() == "") {
        alert(findText("The e-mail is required."));
        return;
    }

    if ($("#formMessage").val() == "") {
        alert(findText("A Message is required."));
        return;
    }
    if (file == null/*Pour Test AUTO*/ && importedFile == null) {
        alert(findText("Please select a documentation file."));
        return;
    }
    var $form = $('#formAddMat'),
        formData = new FormData(),
        params = $form.serializeArray(),
        files = $form.find('[name="imputDoc"]')[0].files;

    if (file != null) {/*Pour Test Auto*/
        formData.append('imputDoc-' + 0, file);
    } else {
        $.each(files, function (i, file) {
            // Prefix the name of uploaded files with "uploadedFiles-"
            // Of course, you can change it to any string
            formData.append('imputDoc-' + i, file);
        });
    }

    if (email != null) {/*Pour Test Auto*/
        formData.append("testEmail", email);
    }


    $.each(params, function (i, val) {
        //console.log(val.name, " = ", val.value);
        formData.append(val.name, val.value);
    });

    $.ajax({
        url: $form.attr('action'),
        type: 'POST',
        data: formData,
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        success: function (msg) {
            $('#AddMatModal').modal('hide');
            alert(msg);
            $("#testProgress").trigger("validateFormAddMat");
        }
    });

}

//NO 451 ajout nouveau matériel
function addModule() {
    /*if (accessPRO != "1") { // NO 1207
        alert(findText("This feature is only available with a PRO version.") + "\n" + findText("You can access to this feature by buying Archelios PRO."));
        return;
    }*/
    clic_on_button("edit_database_addModule", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addmodule').show();
        $('#btn_editmodule').hide();
        seeCharacteristics(null, "mod", 1);
    }
}

function isPanData(sContent) {
    if (sContent.indexOf("PVObject_=pvModule") >= 0) {
        return true;
    }
    return false;
}

//#4857
function isOndData(sContent) {
    if (sContent.indexOf("PVObject_=pvGInverter") >= 0) {
        return true;
    }
    return false;
}

function importModuleFormData(sContent) {
    if (isPanData(sContent)) {
        var lineA = sContent.split('\n'), dataA = [], sLine = "";
        for (var n = 0; n < lineA.length; n++) {
            sLine = lineA[n].trim();
            if (sLine.indexOf("=") >= 0) {
                dataA.push(sLine);
            }
        }
        var fieldA = [], oModule = { comments: "" }, sDbField = "", oDbVal = null;
        for (var n = 0; n < dataA.length; n++) {
            fieldA = dataA[n].split('=');
            fieldA[0] = fieldA[0].trim(); fieldA[1] = fieldA[1].trim();
            if (fieldA[1]) {
                switch (fieldA[0]) {
                    case "Comment":
                    case "Manufacturer":
                    case "Str_1":
                        oModule.comments += ("/" + fieldA[1]);
                        break;
                    case "Model":
                        oModule.name = fieldA[1];
                        break;
                    case "Width":
                        sDbField = "width";
                        oDbVal = parseFloat(fieldA[1]) * 1e3;
                        break;
                    case "Height":
                        sDbField = "length";
                        oDbVal = parseFloat(fieldA[1]) * 1e3;
                        break;
                    case "Depth":
                        sDbField = "thickness";
                        oDbVal = parseFloat(fieldA[1]) * 1e3;
                        break;
                    case "Weight":
                        sDbField = "weight";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "NPieces":
                        break;
                    case "Technol":
                        sDbField = "celltype";
                        oDbVal = fieldA[1];
                        if (
                            oDbVal.toLowerCase().indexOf("mono") >= 0 ||
                            oDbVal.toLowerCase().indexOf("single") >= 0 ||
                            oDbVal.toLowerCase().indexOf("sc-si") >= 0
                        ) {
                            oDbVal = "singlecrystalline (sc-Si)";
                        }
                        else if (oDbVal.toLowerCase().indexOf("cdte") >= 0) {
                            oDbVal = "CdTe";
                        }
                        else if (oDbVal.toLowerCase().indexOf("cis") >= 0) {
                            oDbVal = "CIS";
                        }
                        else if (oDbVal.toLowerCase().indexOf("csg") >= 0) {
                            oDbVal = "CSG";
                        }
                        else if (oDbVal.toLowerCase().indexOf("hit") >= 0) {
                            oDbVal = "HIT";
                        }
                        else if (oDbVal.toLowerCase().indexOf("ribbon") >= 0) {
                            oDbVal = "Ribbon";
                        }
                        else if (oDbVal.toLowerCase().indexOf("a-si") >= 0) {
                            var sDbVal = "a-Si : H (single)";
                            if (oDbVal.toLowerCase().indexOf("tandem") >= 0) {
                                sDbVal = "a-Si : H (tandem)";
                            }
                            else if (oDbVal.toLowerCase().indexOf("triple") >= 0) {
                                sDbVal = "a-Si : H (triple)";
                            }
                            else if (oDbVal.toLowerCase().indexOf("uc-si") >= 0) {
                                sDbVal = "a-Si : H micro c-Si"; // #4647, avant : "a-Si : H \\/ uc-Si"
                            }
                            oDbVal = sDbVal;
                        }
                        else if (oDbVal.toLowerCase().indexOf("mc-si") >= 0) {
                            oDbVal = "multicrystalline (mc-Si)";
                        }
                        else {
                            oDbVal = "multicrystalline (mc-Si)";
                        }
                        break;
                    case "NCelS":
                        sDbField = "nb_cells_series";
                        oDbVal = parseInt(fieldA[1]);
                        break;
                    case "NCelP":
                        sDbField = "nb_cells_parallel";
                        oDbVal = parseInt(fieldA[1]);
                        break;
                    case "NDiode":
                        break;
                    case "GRef":
                        break;
                    case "TRef":
                        break;
                    case "PNom":
                        sDbField = "nominal_power";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "PNomTolLow":
                        break;
                    case "PNomTolUp":
                        break;
                    case "Isc":
                        sDbField = "Isc";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "Voc":
                        sDbField = "Uoc";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "Imp":
                        sDbField = "Impp";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "Vmp":
                        sDbField = "Umpp";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "muISC":
                        sDbField = fieldA[0];
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "muVocSpec":
                        sDbField = fieldA[0];
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "muPmpReq":
                        sDbField = "coefficient_power";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "RShunt":
                        //sDbField = "module_Rsh";
                        break;
                    case "Rp_0":
                    case "Rp_Exp":
                        break;
                    case "RSerie":
                        //sDbField = "module_Rs";
                        break;
                    case "Gamma":
                        sDbField = "n";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "muGamma":
                        break;
                    case "VMaxIEC":
                        sDbField = "Vmax";
                        oDbVal = parseFloat(fieldA[1]);
                        break;
                    case "Absorb":
                    case "ARev":
                    case "BRev":
                    case "RDiode":
                    case "VRevDiode":
                    case "AirMassRef":
                    case "CellArea":
                    case "LIDLoss":
                    case "SandiaAMCorr":
                        break;
                    case "BifacialityFactor":
                        sDbField = "bifaciality_factor";
                        oDbVal = (parseFloat(fieldA[1]) * 100);
                        break;
                    default: break;
                }
                if (sDbField) {
                    oModule[sDbField] = oDbVal;
                    sDbField = "";
                }
            }
        }
        oModule.nb_cells = 0;
        if (oModule.nb_cells_series) {
            oModule.nb_cells = oModule.nb_cells_series;
        }
        if (oModule.nb_cells_parallel) {
            if (oModule.nb_cells) {
                oModule.nb_cells *= (oModule.nb_cells_parallel);
            }
            else {
                oModule.nb_cells = oModule.nb_cells_parallel;
            }
        }
        delete oModule.nb_cells_series; delete oModule.nb_cells_parallel;
        if (oModule.Isc && oModule.muISC) {
            //#4065 Pb grandeurs .pan importé, correction formule de conversion
            //coefficient de température sur le courant en mA/K à ramener en % du Isc.
            // On divise muISC par 1000 et comme c'est un pourcentage on multiplie par 100 => donne *0.1
            oModule.coefficient_current = parseFloat((oModule.muISC / oModule.Isc * 0.1).toFixed(3));
        }
        delete oModule.muISC;
        if (oModule.muVocSpec && oModule.Uoc) {
            //#4065 Pb grandeurs .pan importé, correction formule de conversion
            //On divise muVOCSpec par 1000 pour avoir des volts et comme on veut un pourcentage on multiplie par 100 => on fait *0.1
            oModule.coefficient_voltage = parseFloat((oModule.muVocSpec / oModule.Uoc * 0.1).toFixed(3));
        }
        delete oModule.muVocSpec;
        if (oModule.nominal_power && oModule.width && oModule.length) {
            oModule.efficiency = oModule.nominal_power / (oModule.width * oModule.length * 1e-3);
        }

        if (!oModule.hasOwnProperty("name")) {
            oModule["name"] = "Imported module";
        }
        if (oModule.hasOwnProperty("bifaciality_factor")) {
            oModule["bifacial"] = 1;
        }
        else if (!oModule.hasOwnProperty("bifacial")) {
            oModule["bifacial"] = 0;
        }
        if (!oModule.hasOwnProperty("noct")) {
            /** oModule.noct = 50; */
        }
        if (!oModule.hasOwnProperty("coefficient_voltage")) { }
        if (!oModule.hasOwnProperty("coefficient_power")) { }
        if (!oModule.hasOwnProperty("coefficient_current")) { }
        if (!oModule.hasOwnProperty("module_Io")) { }
        if (!oModule.hasOwnProperty("module_Iph")) { }
        if (!oModule.hasOwnProperty("Irm")) {
            /** oModule["Irm"] = 15; */
        }
        oModule["id_manufacturer"] = $('#manufacturer_module').val();
        oModule["manufacturer"] = getNameWithoutFavoriteIcon($("#manufacturer_module option:selected").text());
        upsertViewModCharacteristics(oModule);
        $('#btn_addmodule').show(); // afficher le bouton directement (pas besoin de cliquer d'abord sur "Ajouter un module", l'import se suffit à lui-même)
        $('#btn_editmodule').hide();
    }
    else {
        alert(findText("The selected file is not in .arch/.pan format") + "\n" + findText("Please check that your file is not binary")); // #4143
    }
}

//#4857
function importInverterFormData(sContent) {

    if (isOndData(sContent)) {
        var lineA = sContent.split('\n'), dataA = [], sLine = "";
        for (var n = 0; n < lineA.length; n++) {
            sLine = lineA[n].trim();
            if (sLine.indexOf("=") >= 0) {
                dataA.push(sLine);
            }
        }
        var fieldA = [], oInv = { inv_manufacturer: $("#manufacturer_inverter option:selected").text(), cosPhi: 1/*#4982*/ }, sDbField = "", oDbVal = null;
        var nbMPPT = 1;
        for (var n = 0; n < dataA.length; n++) {
            fieldA = dataA[n].split('=');
            fieldA[0] = fieldA[0].trim(); fieldA[1] = fieldA[1].trim();
            if (fieldA[1]) {
                switch (fieldA[0]) {
                    case "Model":
                        oInv.name = fieldA[1];
                    case "PNomConv":
                        oInv.nominal_power = parseFloat(fieldA[1]) * 1e3;
                        break;
                    case "PMaxOUT":
                        oInv.Pmax = parseFloat(fieldA[1]) * 1e3;
                        oInv.PmaxAC = parseFloat(fieldA[1]) * 1e3; // #5020
                        break;
                    case "VMppMin":
                        oInv.Vmin = parseFloat(fieldA[1]);
                        break;
                    case "VMPPMax":
                        oInv.Vmax = parseFloat(fieldA[1]);
                        break;
                    case "VAbsMax":
                        oInv.MaxInputV = parseFloat(fieldA[1]);
                        break;
                    case "IMaxDC":
                        oInv.Imax = parseFloat(fieldA[1]);
                        break;
                    case "EfficEuro":
                        oInv.european_efficiency = parseFloat(fieldA[1]);
                        break;
                    case "EfficMax":
                        oInv.efficiency = parseFloat(fieldA[1]);
                        break;
                    case "Str_2":
                        var iIndex = fieldA[1].indexOf("Protection: ")//#4982
                        if (iIndex >= 0) {
                            var sIP = fieldA[1].substring(iIndex + 12)
                            oInv.protection_type = sIP;
                        }
                        break;
                    case "NbInputs":
                        oInv.nb_entries = parseInt(fieldA[1]);
                        break;
                    case "VmppNom":
                        oInv.nominal_voltage = parseFloat(fieldA[1]);
                        break;
                    case "Depth":
                        oInv.width = parseFloat(fieldA[1]) * 1e3;//#4982
                        break;
                    case "Width":
                        oInv.length = parseFloat(fieldA[1]) * 1e3;//#4982
                        break;
                    case "Height":
                        oInv.height = parseFloat(fieldA[1]) * 1e3;
                        break;
                    case "MonoTri":
                        if (fieldA[1] == "Tri")
                            oInv.connection_type = "triphasé";
                        else
                            oInv.connection_type = "monophasé";
                        break;
                    case "VOutConv":
                        oInv.voltageAC = parseFloat(fieldA[1]);
                        break;
                    case "IMaxAC":
                        oInv.currentAC = parseFloat(fieldA[1]);
                        break;
                    case "TanPhiMax":
                        //oInv.cosPhi = Math.cos(Math.atan(parseFloat(fieldA[1]))); -> on met 1 par défaut, comme dans la BDD Excel
                        break;
                    case "Transfo":
                        oInv.inv_transfo = 1;
                        if (fieldA[1] == "Without")
                            oInv.inv_transfo = 0;
                        break;
                    case "NbMPPT":
                        nbMPPT = parseInt(fieldA[1])
                        break;
                    default: break;
                }
            }
        }

        oInv.cost_unit = 0; // mettre le coût à 0 sinon plante dans la requête d'ajout

        var oInvA = [oInv];
        if (nbMPPT > 1) {
            for (var iNumMppt = 0; iNumMppt < nbMPPT; iNumMppt++) {
                var oMppt = JSON.parse(JSON.stringify(oInv));
                oMppt.Imax = oInv.Imax / nbMPPT;
                oMppt.nb_entries = parseInt(oInv.nb_entries / nbMPPT);
                oInvA.push(oMppt);
            }
        }

        $('#btn_addinverter').show();
        $('#btn_editinverter').hide();

        seeCharacteristics(null, "inv", true, oInvA);
    }
    else {
        alert(findText("The selected file is not in .ond format") + "\n" + findText("Please check that your file is not binary")); // #4143
    }
}

$("#fileImportPan").change(function (e) {
    var trace = 0;
    var files = e.target.files;
    if (trace) console.log(files);
    if (files) {
        for (var i = 0, f; f = files[i]; i++) {
            var r = new FileReader();
            r.onload = (function (f) {
                return function (e) {
                    var sContent = e.target.result;
                    return importModuleFormData(sContent);
                };
            })(f);
            r.readAsText(f, 'UTF-8');
            break;
        }
    } else {
        alert("Failed to load files");
    }
});

//#4857
$("#fileImportOnd").change(function (e) {
    var trace = 0;
    var files = e.target.files;
    if (trace) console.log(files);
    if (files) {
        for (var i = 0, f; f = files[i]; i++) {
            var r = new FileReader();
            r.onload = (function (f) {
                return function (e) {
                    var sContent = e.target.result;
                    return importInverterFormData(sContent);
                };
            })(f);
            r.readAsText(f, 'UTF-8');
            break;
        }
    } else {
        alert("Failed to load files");
    }
});

var importModule = function () {
    clic_on_button("edit_database_importModule", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $("#fileImportPan").val("");
        $('#fileImportPan').trigger('click');
    }
};

//#4857
var importInverter = function () {
    clic_on_button("edit_database_importInverter", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true); // #5263 : manquait true
    if (accessDatabase.valide) {
        $("#fileImportOnd").val("");
        $('#fileImportOnd').trigger('click');
    }
};

function testModulesValues(testcompute) {
    var testcompute = testcompute || 0; // on teste au même endroit pour les valeurs nécessaires au calcul Rsh, Rs, ...
    if ($('#typeMod').val() == null) {
        alert(findText("Missing module type"));
        return -1;
    }
    var invalidvalue = findText("Invalid value for");
    if ($('#nbCellsMod').val() == "" || isNaN($('#nbCellsMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_nbcells').text());
        return -1;
    }
    if ($('#PstcMod').val() == "" || isNaN($('#PstcMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_pstc').text());
        return -1;
    }
    if ($('#UocMod').val() == "" || isNaN($('#UocMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_uoc').text());
        return -1;
    }
    if ($('#IscMod').val() == "" || isNaN($('#IscMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_isc').text());
        return -1;
    }
    if ($('#UmppMod').val() == "" || isNaN($('#UmppMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_umpp').text());
        return -1;
    }
    if ($('#ImppMod').val() == "" || isNaN($('#ImppMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_impp').text());
        return -1;
    }
    if ($('#NOCTMod').val() == "" || isNaN($('#NOCTMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_noct').text());
        return -1;
    }
    if ($('#lengthMod').val() == "" || isNaN($('#lengthMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_length').text());
        return -1;
    }
    if ($('#widthMod').val() == "" || isNaN($('#widthMod').val())) {
        alert(invalidvalue + " " + $('#lab_characmod_width').text());
        return -1;
    }

    if ($('#IrmMod').val() == "" || isNaN($('#IrmMod').val())) { //#217
        alert(invalidvalue + " " + $('#lab_characmod_irm').text());
        return -1;
    }
    if ($('#VmaxMod').val() == "" || isNaN($('#VmaxMod').val())) { //#217
        alert(invalidvalue + " " + $('#lab_characmod_vmax').text());
        return -1;
    }

    // #5926
    if ($('#bifacialMod').val() == "1") { // #3833
        if ($('#bifacialityFactorMod').val() == "" || isNaN($('#bifacialityFactorMod').val()) || parseFloat($('#bifacialityFactorMod').val().replace(",", ".")) == 0 || parseFloat($('#bifacialityFactorMod').val().replace(",", ".")) < 0 || parseFloat($('#bifacialityFactorMod').val().replace(",", ".")) > 100) {
            alert(invalidvalue + " " + $('#lab_characmod_bifacialityFactor').text() + "\n" + findText("Please write down a value between 0% et 100%"));
            return -1;
        }
    }

    if (testcompute == 0) // données nécessaires pour ajout module mais pas pour le calcul Rsh, Rs, ... --> si on oblige #941
    {
        if ($('#thicknessMod').val() == "" || isNaN($('#thicknessMod').val())) {
            alert(invalidvalue + " " + $('#lab_characmod_thickness').text());
            return -1;
        }
        if ($('#weightMod').val() == "" || isNaN($('#weightMod').val())) {
            alert(invalidvalue + " " + $('#lab_characmod_weight').text());
            return -1;
        }
        if ($('#RshMod').val() == "" || isNaN($('#RshMod').val()) /*|| parseFloat($('#RshMod').val().replace(",", ".")) <= 0*/ || parseFloat($('#RshMod').val().replace(",", ".")) <= 0) { //#941 on interdit 0 sinon mauvais calcul de prod, #538 : interdit valeur négative, + #3996 + #7388
            alert(invalidvalue + " " + $('#lab_characmod_Rsh').text());
            return -1;
        }
        if ($('#RsMod').val() == "" || isNaN($('#RsMod').val()) || parseFloat($('#RsMod').val().replace(",", ".")) <= 0.02) { // #3996 Rs > 0.05 , #7388  Rs > 0.02
            alert(invalidvalue + " " + $('#lab_characmod_Rs').text());
            return -1;
        }
        if ($('#IoMod').val() == "" || isNaN($('#IoMod').val()) || parseFloat($('#IoMod').val().replace(",", ".")) <= 0) {
            alert(invalidvalue + " " + $('#lab_characmod_Io').text());
            return -1;
        }
        if ($('#IphMod').val() == "" || isNaN($('#IphMod').val()) || parseFloat($('#IphMod').val().replace(",", ".")) <= 0) {
            alert(invalidvalue + " " + $('#lab_characmod_Iph').text());
            return -1;
        }

        if ($('#diode_ideality_factorMod').val() == "" || isNaN($('#diode_ideality_factorMod').val()) || parseFloat($('#diode_ideality_factorMod').val().replace(",", ".")) <= 0) {
            alert(invalidvalue + " " + $('#lab_characmod_diode_ideality_factor').text());
            return -1;
        }
    }
}

function getModuleFromCharacteristics() {
    var efficiency = parseInt($('#PstcMod').val()) / parseInt($('#lengthMod').val()) / parseInt($('#widthMod').val()) * 100000;
    var module = {
        //"name": name,
        //"uid": guidnew,
        "celltype": $('#typeMod').val(),
        "nb_cells": $('#nbCellsMod').val(),
        "bifacial": $('#bifacialMod').val(), // #1994
        "bifaciality_factor": $('#bifacialityFactorMod').val().replace(",", "."), // #3833
        "nominal_power": $('#PstcMod').val(),
        "Uoc": $('#UocMod').val().replace(",", "."), //#941
        "Isc": $('#IscMod').val().replace(",", "."), //#941
        "Umpp": $('#UmppMod').val().replace(",", "."), //#941
        "Impp": $('#ImppMod').val().replace(",", "."), //#941
        "noct": $('#NOCTMod').val(),
        "coefficient_power": $('#PTempMod').val().replace(",", "."), //#941
        "coefficient_current": $('#ITempMod').val().replace(",", "."), //#941
        "coefficient_voltage": $('#VTempMod').val().replace(",", "."), //#941
        "length": $('#lengthMod').val(),
        "width": $('#widthMod').val(),
        "thickness": $('#thicknessMod').val(),
        "weight": $('#weightMod').val(),
        "efficiency": efficiency,
        "module_Rsh": $('#RshMod').val().replace(",", "."), //#941
        "module_Rs": $('#RsMod').val().replace(",", "."), //#941
        "module_Io": $('#IoMod').val().replace(",", "."), //#941
        "module_Iph": $('#IphMod').val().replace(",", "."), //#941
        "diode_ideality_factor": $('#diode_ideality_factorMod').val().replace(",", "."), //#5486
        "Irm": $('#IrmMod').val().replace(",", "."), // #217
        "Vmax": $('#VmaxMod').val().replace(",", "."), // #217
        "id_manufacturer": $('#manufacturer_module').val(),
        "manufacturer": getNameWithoutFavoriteIcon($("#manufacturer_module option:selected").text()), //#8361
        "obsolete": $('#obsoleteMod').val() // #7221
    };
    return module;
}

//NO 451 ajouter module dans la BDD
function addModuleBDD() {
    var name;
    //on teste si toutes les données sont présentes :
    if ($('#nameMod').val() == "") {
        alert(findText("Missing module name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameMod').val());

    var r = testModulesValues();
    if (r == -1)
        return;

    var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    var module = getModuleFromCharacteristics();
    module.name = name;
    module.uid = guidnew;

    //console.log("addModuleBDD : ", $('#ImportFrom').html());
    //console.log($('#ImportFrom').html());
    //NO 664
    if ($('#ImportFrom').html() != "") {
        module.id_manufacturer = $("#ImportManufaturerID").html();
        module.manufacturer = $("#ImportManufaturer").html();
    }
    //console.log(module);
    //product_guarantee,guarantee_of_power_years_1,guarantee_of_power_percent_1,guarantee_of_power_years_2,guarantee_of_power_percent_2,

    addModuleInBDD(module);

    $('#characteristicsModuleModal').modal('hide');
    //NO 664
    if ($('#ImportFrom').html() != "") {
        importModuleAddMaj($('#ImportFrom').html().split("-")[0], $('#ImportFrom').html().split("-")[1], module);
        $('#ImportFrom').html("");
    }
    $("#testProgress").trigger("addModuleBDD", guidnew);
    return
}

function addModuleInBDD(module) {
    $.ajaxSetup({ async: false });
    var datasend = 'actionBDD=addModule&module=' + JSON.stringify(module);

    //console.log("add module ", datasend);
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            //console.log("success add module", msg);
            updateModulesList();
            alert(msg); // NO 526 mettre l'alert après update pour gagner du temps
            $('#characteristicsModuleModal').modal('hide'); // NO 526 : fermer la modal automatiquement
        }
    });
}

//#1811
function UIComputeRshRsIoIph() {
    var r = testModulesValues(1);
    if (r == -1)
        return;

    var module = getModuleFromCharacteristics();

    computeRshRsIoIph(module);

    $('#RshMod').val(module.module_Rsh);
    $('#RsMod').val(module.module_Rs);
    $('#IoMod').val(module.module_Io);
    $('#IphMod').val(module.module_Iph);
    $('#diode_ideality_factorMod').val(module.diode_ideality_factor);
}

function computeValuesForIVcurve(constanteBoltzmann, Isc, Uoc, irradiation, tempCell, O8, B15, B31, Iph, L13, L14, B30, B27, B28, B29, C7, C10, C12) {
    var C14 = Isc + B15 * (Math.exp(Isc * C12 / C10) - 1) + Isc * C12 / C7;
    //if (trace) console.log("C14: ", C14);
    var C15 = (C14 - Uoc / C7) / (Math.exp(Uoc / C10) - 1);//=(C14-$L$5/$C$7)/(EXP($L$5/$C$10)-1)
    var D14 = Isc + C15 * (Math.exp(Isc * C12 / C10) - 1) + Isc * C12 / C7;//$L$4+C15*(EXP($L$4*$C$12/$C$10)-1)+$L$4*$C$12/$C$7
    var D15 = (D14 - Uoc / C7) / (Math.exp(Uoc / C10) - 1); //(D14-$L$5/$C$7)/(EXP($L$5/$C$10)-1)
    var E14 = Isc + D15 * (Math.exp(Isc * C12 / C10) - 1) + Isc * C12 / C7; //=$L$4+D15*(EXP($L$4*$C$12/$C$10)-1)+$L$4*$C$12/$C$7
    var E15 = (E14 - Uoc / C7) / (Math.exp(Uoc / C10) - 1);// =(E14-$L$5/$C$7)/(EXP($L$5/$C$10)-1)
    var F14 = Isc + E15 * (Math.exp(Isc * C12 / C10) - 1) + Isc * C12 / C7;// $L$4+E15*(EXP($L$4*$C$12/$C$10)-1)+$L$4*$C$12/$C$7
    var F15 = (F14 - Uoc / C7) / (Math.exp(Uoc / C10) - 1);
    var Iph = irradiation / 1000.0 * F14 + O8 * (tempCell - 25); // = B21 =B19/1000*F14+O8*($B$20-25)
    var B22 = (1.0 - L14 * (tempCell - 25)) * L13; //=(1-$L$14*($B$20-25))*$L$13
    var B23 = Math.pow((273 + tempCell) / (273 + 25), 3) * Math.exp(L13 / (constanteBoltzmann * (273 + 25)) - B22 / (constanteBoltzmann * (273 + tempCell))) * F15;


    var B21 = (irradiation / 1000 * F14) + (O8 * (tempCell - 25));// =B19/1000*F14+O8*($B$20-25)//Iph;
    var B24 = C12;
    var B25 = C7; // =C7
    var B32 = B31 - (B31 - Iph + B23 * (Math.exp((B30 + B31 * B24) / B27) - 1) + (B30 + B31 * B24) / B25) / (1 + B23 * B24 / B27 * Math.exp((B30 + B31 * B24) / B27) + B24 / B25);
    var B33 = B32 - (B32 - Iph + B23 * (Math.exp((B30 + B32 * B24) / B27) - 1) + (B30 + B32 * B24) / B25) / (1 + B23 * B24 / B27 * Math.exp((B30 + B32 * B24) / B27) + B24 / B25);
    var B34 = B33 - (B33 - Iph + B23 * (Math.exp((B30 + B33 * B24) / B27) - 1) + (B30 + B33 * B24) / B25) / (1 + B23 * B24 / B27 * Math.exp((B30 + B33 * B24) / B27) + B24 / B25);

    var B35 = -(B23 / B27 * Math.exp((B30 + B34 * B24) / B27) + 1 / B25) / (1 + B24 / B25 + B23 * B24 / B27 * Math.exp((B30 + B34 * B24) / B27));// =-($B$23/$B$27*EXP((B30+B34*$B$24)/$B$27)+1/$B$25)/(1+$B$24/$B$25+$B$23*$B$24/$B$27*EXP((B30+B34*$B$24)/$B$27))
    var B36 = B34 + B30 * B35;

    var R37 = [B34]; //  = SI(OU(ABS(B36)<$G$39;1-B30/$B$29<0.0001);B30;C38) = Imp B37
    var R38 = [B30]; // = Vmp B38

    var R28 = [B28];
    var R29 = [B29];
    var R30 = [B30];
    var R34 = [B34];
    var R36 = [B36];

    for (var i = 1; i < 50; i++) { // 50 : au vu du nb de colonne dans le fichier Excel
        if (R36[i - 1] > 0)
            R28.push(R30[i - 1]);
        else
            R28.push(R28[i - 1]);
        if (R36[i - 1] < 0)
            R29.push(R30[i - 1]);
        else
            R29.push(R29[i - 1]);

        R30.push((R28[i] + R29[i]) / 2.0);
        var R31 = R34[i - 1];

        var R32 = R31 - (R31 - B21 + B23 * (Math.exp((R30[i] + R31 * B24) / B27) - 1) + (R30[i] + R31 * B24) / B25) / (1 + B23 * B24 / B27 * Math.exp((R30[i] + R31 * B24) / B27) + B24 / B25);
        var R33 = R32 - (R32 - B21 + B23 * (Math.exp((R30[i] + R32 * B24) / B27) - 1) + (R30[i] + R32 * B24) / B25) / (1 + B23 * B24 / B27 * Math.exp((R30[i] + R32 * B24) / B27) + B24 / B25);

        R34.push(R33 - (R33 - B21 + B23 * (Math.exp((R30[i] + R33 * B24) / B27) - 1) + (R30[i] + R33 * B24) / B25) / (1 + B23 * B24 / B27 * Math.exp((R30[i] + R33 * B24) / B27) + B24 / B25));
        var R35 = -(B23 / B27 * Math.exp((R30[i] + R34[i] * B24) / B27) + 1 / B25) / (1 + B24 / B25 + B23 * B24 / B27 * Math.exp((R30[i] + R34[i] * B24) / B27));
        R36.push(R34[i] + R30[i] * R35);

        if ((Math.abs(R36[i]) < 0.05) || (1 - R30[i] / B29 < 0.0001)) {
            Vmp = R30[i];
            Imp = R34[i];
            R37.push(R34[i]);
            R38.push(R30[i]);
            break;
        }
    }

    var Pmp = R37[R37.length - 1] * R38[R38.length - 1];// B39 =B37*B38 = Imp * Vmp // derniers éléments qui sont les bons !!
    return { "B39_Pmp": Pmp, "F15_Io": F15, "F14_Iph": F14 };
}

function getFacteurIdealite(m_TypeId) {
    // fonction de la techno du module
    var n = 1.05; // par défaut mono-cristallin , #5486
    switch (m_TypeId) {
        case 0: //a-Si : H (single)
            {
                n = 1.4;
                break;
            }
        case 1: //a-Si : H (tandem)
            {
                n = 2.8;
                break;
            }
        case 2:  //a-Si : H (triple)
            {
                n = 4.2;
                break;
            }
        case 3:  //a-Si : H \/ µc-Si , a-Si : H micro c-Si
            {
                n = 1.1;
                break;
            }
        case 4:  // CdTe
            {
                n = 1.5;
                break;
            }
        case 5: //CIS
            {
                n = 1.5;
                break;
            }
        case 6:  // CSG
            {
                n = 1.3;
                break;
            }
        case 7:  // HIT
            {
                n = 1.1; //#5486 1.35;
                break;
            }
        case 8:  // multicrystalline (mc-Si)
            {
                n = 1.1; //#5486 1.35;
                break;
            }
        case 9:  // Ribbon
            {
                n = 1.1; //#5486 1.3;
                break;
            }
        case 10:  // singlecrystalline (sc-Si)
            {
                n = 1.05; //#5486 1.3;
                break;
            }
    }
    return n;
}

//#1811 ajout du moddule en parametre
//#5486 modif générale pour prendre en compte les évolutions de l'Excel
function computeRshRsIoIph(module) { // NO
    var chargeElectron = 1.602 * Math.pow(10, -19); // C2 Coulomb
    var constanteBoltzmann = 1.381 * Math.pow(10, -23); // C3 J/K

    var Pstc = parseFloat(module.nominal_power); // L3
    var Isc = parseFloat(module.Isc); //L4
    var Uoc = parseFloat(module.Uoc); // L5
    var Impp = parseFloat(module.Impp); // L6
    var Umpp = parseFloat(module.Umpp); // L7
    var nbcells = parseInt(module.nb_cells); // = L11
    var coefcurrent = parseFloat(module.coefficient_current) / 100.0; //car %/K et non %/°C
    var coefvoltage = parseFloat(module.coefficient_voltage) / 100.0;
    var typeIdCell = getTypeIdWithCellType(module.celltype);
    var n = getFacteurIdealite(typeIdCell), Eg = getEg(typeIdCell); // = C9 , L12

    var coefn = getCoefNbCellules(typeIdCell); // voltageByCell

    if (nbcells == 0) // quand manque l'info dans la bdd
        nbcells = Math.round(Uoc / coefn);

    var distriCells = distributionParallelSerialNbCells(nbcells, coefn, Uoc);
    var nbSerialCells = distriCells.nbSerialCells;
    var nbParaCells = distriCells.nbParaStrCells;

    if (coefvoltage == 0.0)// si n'existe pas dans la BDD
        coefvoltage = -0.3;// valeur par défaut dans Archelios

    if (module.celltype == "singlecrystalline (sc-Si)") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.025; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "multicrystalline (mc-Si)") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.025; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "a-Si : H (single)") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.075; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "a-Si : H (tandem)") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.084; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "a-Si : H (triple)") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.1; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "a-Si : H micro c-Si") { // #4647 avant : "a-Si : H \/ uc-Si"
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.07; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "CIS") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.05; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "CSG") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.14; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "CdTe") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.04; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "HIT") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.03; // valeur par défaut dans Archelios
    }
    else if (module.celltype == "Ribbon") {
        if (coefcurrent == 0.0) // si n'existe pas dans la BDD
            coefcurrent = 0.025; // valeur par défaut dans Archelios
    }

    //Calcul Rs
    var surfMod = (parseFloat(module.length) / 1000) * (parseFloat(module.width) / 1000.0); // pour avoir en m²
    var surfCell = surfMod * 10000.0 / nbcells; // en cm² = L20

    var irradiation = 1000.0; // W/m² B19
    var tempCell = 25.0; // =B20

    var E10 = 2.0 * constanteBoltzmann * (273 + 25) * nbSerialCells / chargeElectron;
    var valE11 = 1.0 / Impp * (E10 * Math.log((Isc - Impp) / Isc) + Uoc - Umpp); // =SI(1/$L$6*(E10*LN(($L$4-$L$6)/$L$4)+$L$5-$L$7)>0;1/$L$6*(E10*LN(($L$4-$L$6)/$L$4)+$L$5-$L$7);0)
    if (valE11 < 0.0)
        valE11 = 0.0;

    var D10 = 1.0 * constanteBoltzmann * (273 + 25) * nbSerialCells / chargeElectron;
    var valD11 = 1.0 / Impp * (D10 * Math.log((Isc - Impp) / Isc) + Uoc - Umpp); // =1/$L$6*(D10*LN(($L$4-$L$6)/$L$4)+$L$5-$L$7)

    var D12 = 0.5, E12 = 2;
    var xmin_0 = D12 / surfCell * nbSerialCells / nbParaCells; // #4914 et #5486
    var xmax = E12 / surfCell * nbSerialCells / nbParaCells; // #4914 et #5486
    if (xmin_0 < valE11)
        xmin_0 = valE11;

    var xmin = xmin_0;
    if (xmax > valD11) // #4914 et #5486
        xmax = valD11;// #4914 et #5486

    var xM = (xmin + xmax) / 2.0;
    var C12 = xmin; //Range("c12").Value = Rs0

    var E5 = 200.0; // ohm.cm²
    //var E6 = 800.0; // ohm.cm²
    var E7 = 3000.0; // ohm.cm²
    var C5 = Umpp / (Isc - Impp); //=L7/(L4-L6)
    var C6 = C5 * 5.5;

    //Calcul Rsh
    var zmin = E5 / surfCell * nbSerialCells / nbParaCells; // Range("E5").Value / Range("L20").Value * Range("L11").Value * Range("L11").Value / branches
    var zmax = E7 / surfCell * nbSerialCells / nbParaCells; // Range("E7").Value / Range("L20").Value * Range("L11").Value * Range("L11").Value / branches
    if (zmin < C5)
        zmin = C5;
    if (zmax < C6)
        zmax = C6;

    var C7 = (zmin + zmax) / 2.0;

    var O8 = coefcurrent * Isc; // =L8 coef courant *L4 Isc module
    var O9 = coefvoltage * Uoc;//=L9 coef tension * L5 Voc
    var B31 = Impp * irradiation / 1000.0 + O8 * (tempCell - 25); // =L6*$B$19/1000+O8*(B20-25)
    var C10 = n * constanteBoltzmann * (273 + 25) * nbSerialCells / chargeElectron; //=C9*$C$3*(273+25)*$L$11/$C$2
    var L13 = Eg * chargeElectron; //=L12*C2
    var B14 = Isc; // =L4
    var B15 = (B14 - Uoc / C7) / (Math.exp(Uoc / C10) - 1); // Io
    var L14 = nbcells; // nb total de cellules

    // B23 =((273+$B$20)/(273+25))^3*EXP($L$13/($C$3*(273+25))-B22/($C$3*(273+$B$20)))*F15
    var B28 = 0.0; // ??
    var B29 = Uoc + (tempCell - 25) * O9;// L5+(B20-25)*O9
    var B30 = (B28 + B29) / 2; //=(B28+B29)/2
    var B27 = n * constanteBoltzmann * (273 + tempCell) * nbSerialCells / chargeElectron; // = a =B26*$C$3*(273+B20)*$L$11/$C$2

    var j = 0, y2, valuesForIVcurve;
    do {
        xM = (xmin + xmax) / 2.0;
        C12 = xmin; //Range("c12").Value = Rs0

        valuesForIVcurve = computeValuesForIVcurve(constanteBoltzmann, Isc, Uoc, irradiation, tempCell, O8, B15, B31, Iph, L13, L14, B30, B27, B28, B29, C7, C10, C12);
        var y1 = valuesForIVcurve.B39_Pmp - Pstc; // Range("L3").Value = Pstc

        C12 = xM;
        valuesForIVcurve = computeValuesForIVcurve(constanteBoltzmann, Isc, Uoc, irradiation, tempCell, O8, B15, B31, Iph, L13, L14, B30, B27, B28, B29, C7, C10, C12);

        y2 = valuesForIVcurve.B39_Pmp - Pstc; // Range("B39").Value - Range("L3").Value
        if (y1 * y2 > 0)
            xmin = xM;
        else
            xmax = xM;

        j++; // sécurité
    } while ((Math.abs(xmax - xmin) > 0.001) && (j < 1000));

    // si ne passe pas, on abaisse les plages pour finir par converger : (p-e pas utile mais c'est une sécurité)
    if (Math.abs(y2) > 0.005 * Pstc) {
        xmax = xM;
        xmin = xmin_0;
        j = 0;
        do {
            xM = (xmin + xmax) / 2.0;
            C12 = xmin; //Range("c12").Value = Rs0

            valuesForIVcurve = computeValuesForIVcurve(constanteBoltzmann, Isc, Uoc, irradiation, tempCell, O8, B15, B31, Iph, L13, L14, B30, B27, B28, B29, C7, C10, C12);
            var y1 = valuesForIVcurve.B39_Pmp - Pstc; // Range("L3").Value = Pstc

            C12 = xM;
            valuesForIVcurve = computeValuesForIVcurve(constanteBoltzmann, Isc, Uoc, irradiation, tempCell, O8, B15, B31, Iph, L13, L14, B30, B27, B28, B29, C7, C10, C12);

            y2 = valuesForIVcurve.B39_Pmp - Pstc; // Range("B39").Value - Range("L3").Value
            if (y1 * y2 > 0)
                xmin = xM;
            else
                xmax = xM;

            j++; // sécurité
        } while ((Math.abs(xmax - xmin) > 0.001) && (j < 1000));
    }

    var Rsh = C7;
    var Rs = C12;
    var Io = valuesForIVcurve.F15_Io;
    var Iph = valuesForIVcurve.F14_Iph;

    module.module_Rsh = Rsh.toFixed(3);
    module.module_Rs = Rs.toFixed(5);
    module.module_Io = Io.toFixed(12);
    module.module_Iph = Iph.toFixed(3);
    module.diode_ideality_factor = n; // #5486, pour savoir avec quel facteur d'idéalité a été calculé les valeurs Rs, Rsh,...
}

function editModule() {
    clic_on_button("edit_database_editModule", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        //n'est plus nécessaire car plus de Bim&Co
        /*if (typeof g_oUIBim != "undefined" && g_oUIBim.isActive()) {//#2510
            alert(findText("This feature is not available with Bim&Co modules."));
            return;
        }*/
        if ($('#module').val() != null) {
            $('#btn_addmodule').hide();
            $('#btn_editmodule').show();
            seeCharacteristics($('#module').val(), "mod", 1); // module jinko :"2847EFD4-A102-4EEC-AB79-AB1E65F95E1D"
        }
    }
}

// NO 451 éditer/dupliquer dans la BDD
function editModuleBDD() {
    var name;
    //on teste si toutes les données sont présentes :
    if ($('#nameMod').val() == "") {
        alert(findText("Missing module name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameMod').val());

    var r = testModulesValues();
    if (r == -1)
        return;

    var uidmodule = $('#module').val();

    $.ajaxSetup({ async: false });
    //on teste d'abord si le module est un module de BDD officielle
    var creator = "1"; // par défaut officielle
    var datasend = 'actionBDD=findCreatorModule&uidmodule=' + uidmodule;
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            //console.log("success creator module: ", msg);
            creator = msg;
        }
    });

    var module = getModuleFromCharacteristics();
    module.name = name;
    //console.log("creator module: ", creator);
    if (creator == "1") {
        var answer = confirm(findText('This module is part of the official database Archelios') + ". " + findText('Do you want to duplicate it with the changes made?'));
        if (answer) { // YES
            var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            module.uid = guidnew; // on génère un nouvel uid, car plus le même module !

            //console.log("creator = 1 and duplicate" , module);
            //product_guarantee,guarantee_of_power_years_1,guarantee_of_power_percent_1,guarantee_of_power_years_2,guarantee_of_power_percent_2,

            addModuleInBDD(module);
        }
    }
    else {
        // ce n'est pas un module "officiel", on l'édite, met à jour directement
        var answer = confirm(findText('This module already exists') + '. ' + findText('Are you sure you want to update it (this will impact all your projects with this module)?'));
        if (answer) { // YES
            module.uid = uidmodule;
            var datasend = 'actionBDD=updateModule&module=' + JSON.stringify(module);

            //console.log("edit module ", datasend);
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    //console.log("success edit module", msg);
                    alert(msg);
                    deleteRefElementParam(module.uid); // #981
                    updateModulesList();
                }
            });
        }
    }

    $("#testProgress").trigger("editModuleBDD");
}

function deleteModule() {
    clic_on_button("edit_database_deleteModule", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        if (typeof g_oUIBim != "undefined" && g_oUIBim.isActive()) {//#2510
            alert(findText("This feature is not available with a Bim and Co module."));
            return;
        }
        if ($('#module').val() != null) {
            var creator = "1"; // par défaut officielle
            var datasend = 'actionBDD=findCreatorModule&uidmodule=' + $('#module').val();

            $.ajaxSetup({ async: false });
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    //console.log("success creator module: ", msg);
                    creator = msg;
                }
            });

            if (creator == "1") {
                alert(findText('This module is part of the official database Archelios') + '. ' + findText('This module can not be deleted') + '.');
            }
            else {
                var answer = confirm($('#module option:selected').text() + ": " + findText('Do you really want to delete this module?') + " " + findText('This option will affect all your projects with this module.') + " " + findText('Irrevocable option.'));
                if (answer) { // YES
                    var datasend = 'actionBDD=deleteModule&uidmodule=' + $('#module').val();
                    $.ajax({
                        type: "POST",
                        url: './ajax/requetes.php5',
                        data: datasend,
                        success: function (msg) {
                            //console.log("success delete module", msg);
                            updateModulesList();
                            alert(msg);  // NO 526 mettre l'alert après update pour gagner du temps
                        }
                    });
                }
            }
        }
    }
    $("#testProgress").trigger("deleteModule");
}

//NO 451 ajout nouveau matériel
function addInverter() {
    clic_on_button("edit_database_addInverter", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addinverter').show();
        $('#btn_editinverter').hide();

        $('#nbMPPTInv').val("1");
        updateNumberOfMPPT();

        seeCharacteristics(null, "inv", 1);
    }
}

function testInverterValues(name, uidinverter) {
    var invalidvalue = findText("Invalid value for");
    if ($('#PstcInv').val() == "" || isNaN($('#PstcInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_pstc').text());
        return -1;
    }
    if ($('#PmaxInv').val() == "" || isNaN($('#PmaxInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_pmax').text());
        return -1;
    }
    if ($('#PmaxACInv').val() == "" || isNaN($('#PmaxACInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_pmaxAC').text());
        return -1;
    }
    if ($('#VminInv').val() == "" || isNaN($('#VminInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_vmin').text());
        return -1;
    }
    if ($('#VmaxInv').val() == "" || isNaN($('#VmaxInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_vmax').text());
        return -1;
    }
    if ($('#MaxInputVInv').val() == "" || isNaN($('#MaxInputVInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_maxinputv').text());
        return -1;
    }
    if ($('#ImaxInv').val() == "" || isNaN($('#ImaxInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_imax').text());
        return -1;
    }

    //vu avec Cédric et on n'oblige pas l'utilisateur à entrer les données : on peut laisser vide
    if (isNaN($('#Icc_maxInv').val())) { // #6343
        if ($('#ImaxInv').val() != "") { // on teste après si différent car sinon ne passe jamais quand c'est vide dans le même if que isNan
            alert(invalidvalue + " " + $('#lab_characinv_iccmax').text());
            return -1;
        }
        // si input vide, on laisse, c'est "valide"
    }
    if ($('#MaxEffInv').val() == "" || isNaN($('#MaxEffInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_maxeff').text());
        return -1;
    }
    if ($('#EuroEffInv').val() == "" || isNaN($('#EuroEffInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_euroeff').text());
        return -1;
    }
    if (/*$('#CostInv').val() == "" ||*/ isNaN($('#CostInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_cost').text());
        return -1;
    }
    if (/*$('#EntriesInv').val() == "" ||*/ isNaN($('#EntriesInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_entries').text());
        return -1;
    }
    if (/*$('#NominalVoltageInv').val() == "" ||*/ isNaN($('#NominalVoltageInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_nominalvoltage').text());
        return -1;
    }
    if ($('#CosPhiInv').val() == "" || isNaN($('#CosPhiInv').val())) {
        alert(invalidvalue + " " + $('#lab_characinv_cosPhi').text());
        return -1;
    }
    else if (parseFloat($('#CosPhiInv').val()) <= 0 || parseFloat($('#CosPhiInv').val()) > 1) {
        alert(invalidvalue + " " + $('#lab_characinv_cosPhi').text());
        return -1;
    }

    var nbMPPT = parseInt($('#nbMPPTInv').val());

    if (nbMPPT >= 2) {
        var prefixIdEltImax = "#ImaxMPPT";
        var prefixIdEltIcc_max = "#Icc_maxMPPT"; // #6343
        var prefixIdEltNbEntries = "#nbEntriesMPPT";
        for (var m = 0; m < nbMPPT; m++) {
            var idImaxMPPT = prefixIdEltImax + m;
            if ($(idImaxMPPT).val() == "" || isNaN($(idImaxMPPT).val())) {
                alert(invalidvalue + " " + $('#lab_characinv_ImaxMPPT').text() + " MPPT " + (m + 1));
                return -1;
            }

            //vu avec Cédric et on n'oblige pas l'utilisateur à entrer les données : on peut laisser vide
            var idIcc_maxMPPT = prefixIdEltIcc_max + m;
            if (isNaN($(idIcc_maxMPPT).val())) {
                if ($(idIcc_maxMPPT).val() != "") {
                    alert(invalidvalue + " " + $('#lab_characinv_Icc_maxMPPT').text() + " MPPT " + (m + 1));
                    return -1;
                }
            }

            if (isNaN($(prefixIdEltNbEntries + m).val())) {
                alert(invalidvalue + " " + $('#lab_characinv_nbEntries').text() + " MPPT " + (m + 1));
                return -1;
            }
        }
    }

    //on teste si le nom existe déjà avec le même utilisateur, si c'est le cas on ne créé pas car peut générer des erreurs au moment d'une édition ou suppression de l'onduleur
    if (typeof name != "undefined" && typeof uidinverter != "undefined") {
        if (checkIfInverterNameAlreadyExists(name, uidinverter) == true) {
            alert(findText("Inverter name already exists, please change it to validate the action."));
            return -1;
        }
    }
}

function getInverterFromCharacteristics() {
    // #4614 : pouvoir ajouter des MPPT directement avec l'onduleur général
    var nbMPPT = parseInt($('#nbMPPTInv').val());
    if (isNaN(nbMPPT) || nbMPPT < 1)
        nbMPPT = 1;

    var arrImaxMPPT = [], arrIcc_maxMPPT = [], arrNbEntriesMPPT = [], arrUUIDMPPT = [];
    if (nbMPPT >= 2) {
        for (var m = 0; m < nbMPPT; m++) {
            arrImaxMPPT.push($('#ImaxMPPT' + m).val());
            arrIcc_maxMPPT.push($('#Icc_maxMPPT' + m).val());
            arrNbEntriesMPPT.push($('#nbEntriesMPPT' + m).val());
            arrUUIDMPPT.push(getUniqueId(userid));
        }
    }

    var inverter = {
        "nominal_power": $('#PstcInv').val(),
        "Pmax": $('#PmaxInv').val(),
        "PmaxAC": $('#PmaxACInv').val(), // #5020
        "Vmin": $('#VminInv').val(),
        "Vmax": $('#VmaxInv').val(),
        "MaxInputV": $('#MaxInputVInv').val(), // NO 605
        "Imax": $('#ImaxInv').val(),
        "Icc_max": $('#Icc_maxInv').val(),
        "efficiency": $('#MaxEffInv').val(),
        "european_efficiency": $('#EuroEffInv').val(),
        "cost_unit": $('#CostInv').val(),
        "protection_type": decodeURIComponent($('#ProtectionInv').val()),
        "nb_entries": $('#EntriesInv').val(),
        "nominal_voltage": $('#NominalVoltageInv').val(),
        "length": $('#LengthInv').val(),
        "width": $('#WidthInv').val(),
        "height": $('#HeightInv').val(),
        "transfo": $('#transfoInv').val(), //#217 rajout pour CALC
        "connection_type": $('#TypeConnectingInv').val(), // #217
        "voltageAC": $('#VoltageACInv').val(), // #217
        "currentAC": $('#CurrentACInv').val(), // #217
        "cosPhi": $('#CosPhiInv').val(), // #217
        "SC_RF_CEI_62109": $('#SC_RF_CEI_62109Inv').val(),// #217
        "obsolete": $('#obsoleteInv').val(), // #7221
        "id_manufacturer": $('#manufacturer_inverter').val(),
        "manufacturer": getNameWithoutFavoriteIcon($("#manufacturer_inverter option:selected").text()), // #8361
        "nbMPPT": nbMPPT,
        "arrImaxMPPT": arrImaxMPPT,
        "arrIcc_maxMPPT": arrIcc_maxMPPT, // #6343
        "arrNbEntriesMPPT": arrNbEntriesMPPT,
        "arrUUIDMPPT": arrUUIDMPPT
    };
    return inverter;
}

// #4614 Pour les onduleurs, mettre un système automatique pour créer X MPPT
function addInverterMultiMPPT() {
    clic_on_button("edit_database_addInverterMultiMPPT", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true); //
    if (accessDatabase.valide) {
        // créer l'interface directement en js
        $('#btn_addinverter').show();
        $('#btn_editinverter').hide();

        $('#nbMPPTInv').val("2");
        updateNumberOfMPPT();

        seeCharacteristics(null, "inv", 1);
    }
}

function updateNumberOfMPPT() {
    var modalInv = $('#characteristicsInverterModal');
    var nbMPPT = parseInt(modalInv.find('#nbMPPTInv').val());
    if (nbMPPT >= 2) {
        modalInv.find(".forMPPT").show();
        var sContentTableMPPT = "";
        for (var m = 0; m < nbMPPT; m++) {
            sContentTableMPPT += "<tr><th>MPPT " + (m + 1) + "</th>";
            sContentTableMPPT += "<td><input type=\"number\" class=\"form-control charactinv\" id=\"ImaxMPPT" + m + "\" value=\"\" </td>";
            sContentTableMPPT += "<td><input type=\"number\" class=\"form-control charactinv\" id=\"Icc_maxMPPT" + m + "\" value=\"\" </td>"; // #6343 intégrer Icc_max
            sContentTableMPPT += "<td><input type=\"number\" class=\"form-control charactinv\" id=\"nbEntriesMPPT" + m + "\" value=\"\" </td>";
        }

        modalInv.find("#dataForMPPT").empty().append(sContentTableMPPT); // on vide puis on ajoute le contenu
    }
    else {
        modalInv.find(".forMPPT").hide();
    }
}

//NO 451 ajouter module dans la BDD
function addInverterBDD() {
    //on teste si toutes les données sont présentes :
    if ($('#nameInv').val() == "") {
        alert(findText("Missing inverter name"));
        return;
    }

    var name = decodeURIComponent($('#nameInv').val());

    var r = testInverterValues();
    if (r == -1)
        return;

    var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    var inverter = getInverterFromCharacteristics();
    inverter.name = name;
    inverter.uid = guidnew;

    //console.log(inverter);
    addInverterInBDD(inverter);

    $("#testProgress").trigger("addInverterBDD", guidnew);
    $('#characteristicsInverterModal').modal('hide');
}

function addInverterInBDD(inverter) {
    $.ajaxSetup({ async: false });
    var datasend = 'actionBDD=addInverter&inverter=' + JSON.stringify(inverter);

    //console.log("add inverter ", datasend);
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            //console.log("success add inverter", msg);
            updateInvertersListManual();
            alert(msg);  // NO 526 mettre l'alert après update pour gagner du temps
            $('#characteristicsInverterModal').modal('hide');
        }
    });
}

function editInverter() {
    clic_on_button("edit_database_editInverter", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addinverter').hide();
        $('#btn_editinverter').show();

        seeCharacteristicsInverterSelect(1);
    }

}

// NO 451 éditer/dupliquer dans la BDD
function editInverterBDD() {
    var value = "";
    if ($onduleur != null && $("#choiceconfigradio_auto").prop("checked")) //if (!$("#checkbox_config").prop("checked")) // NO 690 si les config sont auto
    {
        if ($onduleur.val() != null) {
            value = String($onduleur.val());
            var nbval = value.search(","); //on cherche s'il y a plusieurs options sélectionnées
            if (nbval != -1) { // multiples options
                alert(findText("Please select one inverter in the list"));
                return;
            }
        }
    }
    else { // NO 690 si les config sont manuelles, on prend l'onduleur sélectionné manuellement (n'est affiché que là en plus si l'utilisateur a fait une erreur ...)
        if ($("#userchoice_inverter").val() != "") {
            value = String($("#userchoice_inverter").val());
        }
        else {
            alert(findText("Please select one inverter in the list"));
            return;
        }
    }

    var uidinverter = value; // que si une seule valeur, d'où le test juste avant

    var name;
    //on teste si toutes les données sont présentes :
    if ($('#nameInv').val() == "") {
        alert(findText("Missing inverter name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameInv').val());

    var r = testInverterValues(name, uidinverter);
    if (r == -1)
        return;

    $.ajaxSetup({ async: false });
    //on teste d'abord si l'onduleur est un onduleur de BDD officielle
    var creator = "1"; // par défaut officielle
    var datasend = 'actionBDD=findCreatorInverter&uidinverter=' + uidinverter;

    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            //console.log("success creator inverter: ", msg);
            creator = msg;
        }
    });

    var inverter = getInverterFromCharacteristics();
    inverter.name = name;
    //console.log("creator: ", creator, " inverter: ", inverter);

    if (creator == "1") {
        var answer = confirm(findText('This inverter is part of the official database Archelios') + ". " + findText('Do you want to duplicate it with the changes made?'));
        if (answer) { // YES
            var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            inverter.uid = guidnew; // on génère un nouvel uid, car plus le même inverter !

            //console.log("creator = 1 and duplicate", inverter);
            //product_guarantee,guarantee_of_power_years_1,guarantee_of_power_percent_1,guarantee_of_power_years_2,guarantee_of_power_percent_2,

            addInverterInBDD(inverter);
        }
    }
    else {
        // ce n'est pas un onduleur "officiel", on l'édite, met à jour directement
        var answer = confirm(findText('This inverter already exists') + '. ' + findText('Are you sure you want to update it (this will impact all your projects with this inverter)?'));
        if (answer) { // YES
            inverter.uid = uidinverter;
            var datasend = 'actionBDD=updateInverter&inverter=' + JSON.stringify(inverter);

            //console.log("edit inverter ", datasend);
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    //console.log("success edit inverter", msg);
                    alert(msg);
                    //deleteRefElementParam(inverter.uid); // #981
                    updateInvertersListManual();
                }
            });
        }
    }
    $("#testProgress").trigger("editInverterBDD")
}

function deleteInverter() {
    clic_on_button("edit_database_deleteInverter", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        var value = "";
        var nameinverter = "";
        if ($onduleur != null && $("#choiceconfigradio_auto").prop("checked")) //if (!$("#checkbox_config").prop("checked")) // NO 690 si les config sont auto
        {
            if ($onduleur.val() != null) {
                value = String($onduleur.val());
                nbval = value.search(","); //on cherche s'il y a plusieurs options sélectionnées
                if (nbval != -1) { // multiples options
                    alert(findText("Please select one inverter in the list"));
                    return;
                }
                nameinverter = $('#onduleur option:selected').text();
            }
        }
        else { // NO 690 si les config sont manuelles, on prend l'onduleur sélectionné manuellement (n'est affiché que là en plus si l'utilisateur a fait une erreur ...)
            if ($("#userchoice_inverter").val() != "") {
                value = String($("#userchoice_inverter").val());
                nameinverter = $('#userchoice_inverter option:selected').text();
            }
            else {
                alert(findText("Please select one inverter in the list"));
                return;
            }
        }

        var uidinverter = value; // que si une seule valeur, d'où le test juste avant

        if (uidinverter != "") {
            var creator = "1"; // par défaut officielle
            var datasend = 'actionBDD=findCreatorInverter&uidinverter=' + value;

            $.ajaxSetup({ async: false });
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    //console.log("success creator inverter: ", msg);
                    creator = msg;
                }
            });

            if (creator == "1") {
                alert(findText('This inverter is part of the official database Archelios') + '. ' + findText('This inverter can not be deleted') + '.');
            }
            else {
                var answer = confirm(nameinverter + ": " + findText('Do you really want to delete this inverter?') + ' ' + findText('This option will affect all your projects with this inverter.') + ' ' + findText('This will also remove all associated MPPTs.') + ' ' + findText('Irrevocable option.'));
                if (answer) { // YES

                    var datasend = 'actionBDD=deleteInverter&uidinverter=' + uidinverter;
                    $.ajax({
                        type: "POST",
                        url: './ajax/requetes.php5',
                        data: datasend,
                        success: function (msg) {
                            //console.log("success delete inverter", msg);
                            updateInvertersListManual();
                            alert(msg);  // NO 526 mettre l'alert après update pour gagner du temps
                        }
                    });
                }
            }
        }
    }
    $("#testProgress").trigger("deleteInverter")
}

// #8003 séparation optimiseur dans une table spécifique (pas dans la même que les onduleurs)
function addOptimizer() {
    clic_on_button("edit_database_addOptimizer", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addoptimizer').show();
        $('#btn_editoptimizer').hide();
        seeCharacteristics(null, "optimizer", 1);
    }
}

function testOptimizerValues() {
    var invalidvalue = findText("Invalid value for");
    if ($('#PstcOpt').val() == "" || isNaN($('#PstcOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_pstc').text());
        return -1;
    }
    if ($('#ImaxOpt').val() == "" || isNaN($('#ImaxOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_imax').text());
        return -1;
    }
    if ($('#MaxEffOpt').val() == "" || isNaN($('#MaxEffOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_maxeff').text());
        return -1;
    }
    if ($('#EuroEffOpt').val() == "" || isNaN($('#EuroEffOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_euroeff').text());
        return -1;
    }
    if ($('#VminOpt').val() == "" || isNaN($('#VminOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_vmin').text());
        return -1;
    }
    if ($('#VmaxOpt').val() == "" || isNaN($('#VmaxOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_vmax').text());
        return -1;
    }
    if ($('#MaxInputVOpt').val() == "" || isNaN($('#MaxInputVOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_maxinputv').text());
        return -1;
    }
    if ($('#VoltageOutputMaxOpt').val() == "" || isNaN($('#VoltageOutputMaxOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_voltageAC').text());
        return -1;
    }
    if ($('#CurrentOutputMaxOpt').val() == "" || isNaN($('#CurrentOutputMaxOpt').val())) {
        alert(invalidvalue + " " + $('#lab_characopt_currentAC').text());
        return -1;
    }
}

function getOptimizerFromCharacteristics() {
    var optimizer = {
        "nominal_power": $('#PstcOpt').val(),
        "Imax": $('#ImaxOpt').val(),
        "efficiency": $('#MaxEffOpt').val(),
        "european_efficiency": $('#EuroEffOpt').val(),
        "Vmin": $('#VminOpt').val(),
        "Vmax": $('#VmaxOpt').val(),
        "MaxInputV": $('#MaxInputVOpt').val(),
        "length": $('#LengthOpt').val(),
        "width": $('#WidthOpt').val(),
        "height": $('#HeightOpt').val(),
        "voltage_output_max": $('#VoltageOutputMaxOpt').val(),
        "current_output_max": $('#CurrentOutputMaxOpt').val(),
        "protection_type": $('#ProtectionOpt').val(),
        "SC_RF_CEI_62109": $('#SC_RF_CEI_62109Opt').val(),
        "obsolete": $('#obsoleteOpt').val(),
        "id_manufacturer": $('#manufacturer_optimizer').val() // pour l'instant même liste de fabricant donc même id (plus simple pour la séparation et la gestion)
    };
    return optimizer;
}

function addOptimizerBDD() {
    var name;
    //on teste si toutes les données sont présentes :
    if ($('#nameOpt').val() == "") {
        alert(findText("Missing optimizer name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameOpt').val());

    var r = testOptimizerValues();
    if (r == -1)
        return;

    var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    var optimizer = getOptimizerFromCharacteristics();
    optimizer.name = name;
    optimizer.uid = guidnew;

    addOptimizerInBDD(optimizer);

    $('#characteristicsOptimizerModal').modal('hide');
}

function addOptimizerInBDD(optimizer) {
    $.ajaxSetup({ async: false });
    var datasend = 'actionBDD=addOptimizer&optimizer=' + JSON.stringify(optimizer);
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            //console.log("success add optimizer", msg);
            alert(msg);
            updateOptimizersList();
        }
    });
}

function editOptimizer() {
    clic_on_button("edit_database_editOptimizer", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addoptimizer').hide();
        $('#btn_editoptimizer').show();

        if ($("#optimizer").val() != "" && $("#optimizer").val() != "-1") {
            seeCharacteristicsOptimizerSelect(1);
        }
        else
            alert(findText("No optimizer is selected."));
    }
}

// NO 451 éditer/dupliquer dans la BDD
function editOptimizerBDD() {
    var uidoptimizer = String($("#optimizer").val());

    var name;
    //on teste si toutes les données sont présentes :
    if ($('#nameOpt').val() == "") {
        alert(findText("Missing optimizer name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameOpt').val());

    var r = testOptimizerValues(name, uidoptimizer);
    if (r == -1)
        return;

    $.ajaxSetup({ async: false });
    //on teste d'abord si l'optimiseur est un optimiseur de BDD officielle
    var creator = "1"; // par défaut officielle
    var datasend = 'actionBDD=findCreatorOptimizer&uidoptimizer=' + uidoptimizer;

    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            creator = msg;
        }
    });

    var optimizer = getOptimizerFromCharacteristics();
    optimizer.name = name;
    //console.log("creator: ", creator, " optimizer: ", optimizer);

    if (creator == "1") {
        var answer = confirm(findText('This optimizer is part of the official database Archelios') + ". " + findText('Do you want to duplicate it with the changes made?'));
        if (answer) { // YES
            var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            optimizer.uid = guidnew; // on génère un nouvel uid, car plus le même optimizer !

            //console.log("creator = 1 and duplicate", optimizer);
            //product_guarantee,guarantee_of_power_years_1,guarantee_of_power_percent_1,guarantee_of_power_years_2,guarantee_of_power_percent_2,

            addOptimizerInBDD(optimizer);
        }
    }
    else {
        // ce n'est pas un optimiseur "officiel", on l'édite, met à jour directement
        var answer = confirm(findText('This optimizer already exists') + '. ' + findText('Are you sure you want to update it (this will affect all your projects with this optimizer)?'));
        if (answer) { // YES
            optimizer.uid = uidoptimizer;
            var datasend = 'actionBDD=updateOptimizer&optimizer=' + JSON.stringify(optimizer);

            //console.log("edit optimizer ", datasend);
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    //console.log("success edit optimizer", msg);
                    alert(msg);

                    updateOptimizersList();
                }
            });
        }
    }
}

function deleteOptimizer() {
    clic_on_button("edit_database_deleteOptimizer", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        var nameoptimizer = $('#optimizer option:selected').text();;
        var uidoptimizer = $("#optimizer").val();

        if (uidoptimizer != "" && uidoptimizer != "-1") {
            var creator = "1"; // par défaut officielle
            var datasend = 'actionBDD=findCreatorOptimizer&uidoptimizer=' + uidoptimizer;

            $.ajaxSetup({ async: false });
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    creator = msg;
                }
            });

            if (creator == "1") {
                alert(findText('This optimizer is part of the official database Archelios') + '. ' + findText('This optimizer can not be deleted') + '.');
            }
            else {
                var answer = confirm(nameoptimizer + ": " + findText('Do you really want to delete this optimizer?') + ' ' + findText('This option will affect all your projects with this optimizer.') + ' ' + findText('Irrevocable option.'));
                if (answer) { // YES

                    var datasend = 'actionBDD=deleteOptimizer&uidoptimizer=' + uidoptimizer;
                    $.ajax({
                        type: "POST",
                        url: './ajax/requetes.php5',
                        data: datasend,
                        success: function (msg) {
                            //console.log("success delete optimizer", msg);
                            updateOptimizersList();
                            alert(msg);  // NO 526 mettre l'alert après update pour gagner du temps
                        }
                    });
                }
            }
        }
        else
            alert(findText("No optimizer is selected."));
    }
}

//NO 467 ajout batteries
function addBattery() {
    clic_on_button("edit_database_addBattery", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addbattery').show();
        $('#btn_editbattery').hide();
        seeCharacteristics(null, "battery", 1);
    }
}

function testBatteryValues() {
    if ($('#TypeBat').val() == null) {
        alert(findText("Missing battery type"));
        return -1;
    }
    var invalidvalue = findText("Invalid value for");
    if ($('#VoltageBat').val() == "" || isNaN($('#VoltageBat').val())) {
        alert(invalidvalue + " " + $('#lab_characbat_voltage').text());
        return -1;
    }
    if ($('#CapacityBat').val() == "" || isNaN($('#CapacityBat').val())) {
        alert(invalidvalue + " " + $('#lab_characbat_capacity').text());
        return -1;
    }
    if ($('#FaradicEficiencyBat').val() == "" || isNaN($('#FaradicEficiencyBat').val())) {
        alert(invalidvalue + " " + $('#lab_characbat_faradic_efficiency').text());
        return -1;
    }
    if ($('#UnloadDeepnessBat').val() == "" || isNaN($('#UnloadDeepnessBat').val())) {
        alert(invalidvalue + " " + $('#lab_characbat_unload_deepness').text());
        return -1;
    }
    if ($('#MonthSelfunloadingBat').val() == "" || isNaN($('#MonthSelfunloadingBat').val())) {
        alert(invalidvalue + " " + $('#lab_characbat_month_self_unloading').text());
        return -1;
    }
    if ($('#NumberCyclesBat').val() == "" || isNaN($('#NumberCyclesBat').val())) {
        alert(invalidvalue + " " + $('#lab_characbat_number_cycles').text());
        return -1;
    }
    if ($('#LifetimeBat').val() == "" || isNaN($('#LifetimeBat').val())) {
        alert(invalidvalue + " " + $('#lab_characbat_lifetime').text());
        return -1;
    }
    if ($('#VolumeBat').val() == "" || isNaN($('#VolumeBat').val())) { // p-e pas obligatoire...
        alert(invalidvalue + " " + $('#lab_characbat_volume').text());
        return -1;
    }
    if ($('#WeightBat').val() == "" || isNaN($('#WeightBat').val())) { // p-e pas obligatoire...
        alert(invalidvalue + " " + $('#lab_characbat_weight').text());
        return -1;
    }

}

function getBatteryFromCharacteristics() {
    var battery = {
        //"name": name,
        //"uid": guidnew,
        "type": $('#TypeBat').val(),
        "voltage_element": $('#VoltageBat').val(),
        "capacity_element": $('#CapacityBat').val(),
        "faradic_efficiency": $('#FaradicEficiencyBat').val(),
        "unload_deepness": $('#UnloadDeepnessBat').val(),
        "month_self_unloading": $('#MonthSelfunloadingBat').val(),
        "number_cycles": $('#NumberCyclesBat').val(),
        //"unit_cost": $('#CostBat').val() ,
        "lifetime": $('#LifetimeBat').val(),
        "volume": $('#VolumeBat').val(),
        "weight": $('#WeightBat').val(),
        "obsolete": $('#obsoleteBat').val(), // #7221
        "id_manufacturer": $('#manufacturer_battery').val(),
        "manufacturer": getNameWithoutFavoriteIcon($("#manufacturer_battery option:selected").text()) // #8361
    };
    return battery;
}

//NO 467 ajouter batteries
function addBatteryBDD() {
    var name;
    //on teste si toutes les données sont présentes :
    if ($('#nameBat').val() == "") {
        alert(findText("Missing battery name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameBat').val());

    var r = testBatteryValues();
    if (r == -1)
        return;

    var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    var batterie = getBatteryFromCharacteristics();
    batterie.name = name;
    batterie.uid = guidnew;

    addBatteryInBDD(batterie);

    $("#testProgress").trigger("addBatteryBDD", guidnew)
    $('#characteristicsBatteryModal').modal('hide');
}

function addBatteryInBDD(battery) {
    $.ajaxSetup({ async: false });
    var datasend = 'actionBDD=addBattery&battery=' + JSON.stringify(battery);

    //console.log("add battery ", datasend);
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            //console.log("success add batterie", msg);
            alert(msg);
            updateBatteriesList();
        }
    });
}

function editBattery() {
    clic_on_button("edit_database_editBattery", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addbattery').hide();
        $('#btn_editbattery').show();
        seeCharacteristicsBatterySelect(1);
    }
}

// éditer/dupliquer dans la BDD
function editBatteryBDD() {
    if ($('#battery').val() != null) {
        var uidbattery = $('#battery').val();
        //console.log("editBatteryBDD:", uidbattery);
        var name;
        //on teste si toutes les données sont présentes :
        if ($('#nameBat').val() == "") {
            alert(findText("Missing battery name"));
            return;
        }
        else
            name = decodeURIComponent($('#nameBat').val());

        var r = testBatteryValues();
        if (r == -1)
            return;

        $.ajaxSetup({ async: false });
        //on teste d'abord si la batterie est une batterie de BDD officielle
        var creator = "1"; // par défaut officielle
        var datasend = 'actionBDD=findCreatorBattery&uidbattery=' + uidbattery;

        $.ajax({
            type: "POST",
            url: './ajax/requetes.php5',
            data: datasend,
            success: function (msg) {
                //console.log("success creator battery: ", msg);
                creator = msg;
            }
        });

        var battery = getBatteryFromCharacteristics();
        battery.name = name;
        //console.log("creator: ", creator, " battery: ", battery);

        if (creator == "1") {
            var answer = confirm(findText('This battery is part of the official database Archelios') + '. ' + findText('Do you want to duplicate it with the changes made?'));
            if (answer) { // YES
                var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                battery.uid = guidnew; // on génère un nouvel uid, car plus le même inverter !

                //console.log("creator = 1 and duplicate battery", battery);
                //product_guarantee,guarantee_of_power_years_1,guarantee_of_power_percent_1,guarantee_of_power_years_2,guarantee_of_power_percent_2,

                addBatteryInBDD(battery);
            }
        }
        else {
            // ce n'est pas un onduleur "officiel", on l'édite, met à jour directement
            var answer = confirm(findText('This battery already exists') + '. ' + findText('Are you sure you want to update it (this will impact all your projects with this battery)?'));
            if (answer) { // YES
                battery.uid = uidbattery;
                var datasend = 'actionBDD=updateBattery&battery=' + JSON.stringify(battery);

                //console.log("edit battery ", datasend);
                $.ajax({
                    type: "POST",
                    url: './ajax/requetes.php5',
                    data: datasend,
                    success: function (msg) {
                        //console.log("success edit battery", msg);
                        alert(msg);
                        updateBatteriesList();
                    }
                });
            }
        }
    }
    $("#testProgress").trigger("editBatteryBDD");
}

function deleteBattery() {
    clic_on_button("edit_database_deleteBattery", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        if ($('#battery').val() != null) {
            var uidbattery = $('#battery').val();
            var creator = "1"; // par défaut officielle
            var datasend = 'actionBDD=findCreatorBattery&uidbattery=' + uidbattery;

            $.ajaxSetup({ async: false });
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    //console.log("success creator battery: ", msg);
                    creator = msg;
                }
            });

            if (creator == "1") {
                alert(findText('This battery is part of the official database Archelios') + '. ' + findText('This battery can not be deleted') + '.');
            }
            else {
                var answer = confirm($('#battery option:selected').text() + ": " + findText('Do you really want to delete this battery?') + ' ' + findText('This option will affect all your projects with this battery.') + ' ' + findText('Irrevocable option.'));
                if (answer) { // YES
                    var datasend = 'actionBDD=deleteBattery&uidbattery=' + uidbattery;

                    $.ajax({
                        type: "POST",
                        url: './ajax/requetes.php5',
                        data: datasend,
                        success: function (msg) {
                            //console.log("success delete battery", msg);
                            alert(msg);
                            updateBatteriesList();
                        }
                    });
                }
            }
        }
    }
    $("#testProgress").trigger("deleteBattery");
}

// #5394 : ajout des transfo (et donc de la gestion BDD qui va avec)
function addTransformer() {
    clic_on_button("edit_database_addTransformer", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addtransformer').show();
        $('#btn_edittransformer').hide();
        seeCharacteristics(null, "transformer", 1);
    }
}

function testTransformerValues() {
    if ($('#manuTransfo').val() == null) {
        alert(findText("Missing transformer manufacturer"));
        return -1;
    }
    var invalidvalue = findText("Invalid value for");
    if ($('#VoltageLVTransfo').val() == "" || isNaN($('#VoltageLVTransfo').val())) {
        alert(invalidvalue + " " + $('#lab_characttransfo_LVvoltage').text());
        return -1;
    }
    if ($('#VoltageHVTransfo').val() == "" || isNaN($('#VoltageHVTransfo').val())) {
        alert(invalidvalue + " " + $('#lab_characttransfo_HVvoltage').text());
        return -1;
    }
    if ($('#NbLVWindingsTransfo').val() == "" || isNaN($('#NbLVWindingsTransfo').val())) {
        alert(invalidvalue + " " + $('#lab_characttransfo_NbLVWindings').text());
        return -1;
    }
    if ($('#RatedPowerTransfo').val() == "" || isNaN($('#RatedPowerTransfo').val())) {
        alert(invalidvalue + " " + $('#lab_characttransfo_ratedPower').text());
        return -1;
    }
    if ($('#Efficiency100Transfo').val() == "" || isNaN($('#Efficiency100Transfo').val())) {// p-e pas obligatoire...
        alert(invalidvalue + " " + $('#lab_characttransfo_efficiency_100').text());
        return -1;
    }
    if ($('#Efficiency75Transfo').val() == "" || isNaN($('#Efficiency75Transfo').val())) {// p-e pas obligatoire...
        alert(invalidvalue + " " + $('#lab_characttransfo_efficiency_75').text());
        return -1;
    }
    if ($('#NoLoadLossesTransfo').val() == "" || isNaN($('#NoLoadLossesTransfo').val())) {
        alert(invalidvalue + " " + $('#lab_characttransfo_noLoadLosses').text());
        return -1;
    }
    if ($('#FullLoadLossesTransfo').val() == "" || isNaN($('#FullLoadLossesTransfo').val())) {
        alert(invalidvalue + " " + $('#lab_characttransfo_fullLoadLosses').text());
        return -1;
    }
    if ($('#UccTransfo').val() == "" || isNaN($('#UccTransfo').val())) {
        alert(invalidvalue + " " + $('#lab_characttransfo_ucc').text());
        return -1;
    }
}

function getTransformerFromCharacteristics() {
    var transformer = {
        "voltage_LV": $('#VoltageLVTransfo').val(),
        "voltage_HV": $('#VoltageHVTransfo').val(),
        "nb_LV_Coils": $('#NbLVWindingsTransfo').val(),
        "winding_type": $('#WindingConnectionTransfo').val(),
        "ratedPower": $('#RatedPowerTransfo').val(),
        "efficiency_100": $('#Efficiency100Transfo').val(),
        "efficiency_75": $('#Efficiency75Transfo').val(),
        "no_load_losses": $('#NoLoadLossesTransfo').val(),
        "full_load_losses": $('#FullLoadLossesTransfo').val(),
        "ucc": $('#UccTransfo').val(),
        "manufacturer": getNameWithoutFavoriteIcon($('#manuTransfo').val())
    };
    return transformer;
}

//NO 467 ajouter batteries
function addTransformerBDD() {
    var name;
    //on teste si toutes les données sont présentes :
    if ($('#nameTransfo').val() == "") {
        alert(findText("Missing transformer name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameTransfo').val());

    var r = testTransformerValues();
    if (r == -1)
        return;

    var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    var transformer = getTransformerFromCharacteristics();
    transformer.name = name;
    transformer.uid = guidnew;

    addTransformerInBDD(transformer);

    $('#characteristicsTransformerModal').modal('hide');
}

function addTransformerInBDD(transformer) {
    $.ajaxSetup({ async: false });
    var datasend = 'actionBDD=addTransformer&transformer=' + JSON.stringify(transformer);

    //console.log("add battery ", datasend);
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: datasend,
        success: function (msg) {
            //console.log("success add batterie", msg);
            alert(msg);
            updateTransformersList();
        }
    });
}

function editTransformer() {
    clic_on_button("edit_database_editTransformer", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        $('#btn_addtransformer').hide();
        $('#btn_edittransformer').show();
        seeCharacteristicsTransformerSelect(1);
    }
}

// éditer/dupliquer dans la BDD
function editTransformerBDD() {
    if ($('#userchoice_transformer').val() != null) {
        var uidtransfo = $('#userchoice_transformer').val();
        //console.log("editTransformerBDD:", uidtransfo);
        var name;
        //on teste si toutes les données sont présentes :
        if ($('#nameTransfo').val() == "") {
            alert(findText("Missing transformer name"));
            return;
        }
        else
            name = decodeURIComponent($('#nameTransfo').val());

        var r = testTransformerValues();
        if (r == -1)
            return;

        $.ajaxSetup({ async: false });
        //on teste d'abord si la batterie est une batterie de BDD officielle
        var creator = "1"; // par défaut officielle
        var datasend = 'actionBDD=findCreatorTransformer&uidtransformer=' + uidtransfo;

        $.ajax({
            type: "POST",
            url: './ajax/requetes.php5',
            data: datasend,
            success: function (msg) {
                //console.log("success creator transformer: ", msg);
                creator = msg;
            }
        });

        var transformer = getTransformerFromCharacteristics();
        transformer.name = name;
        //console.log("creator: ", creator, " transformer: ", transformer);

        if (creator == "1") {
            var answer = confirm(findText('This transformer is part of the official database Archelios') + '. ' + findText('Do you want to duplicate it with the changes made?'));
            if (answer) { // YES
                var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                transformer.uid = guidnew; // on génère un nouvel uid, car plus le même inverter !
                addTransformerInBDD(transformer);
            }
        }
        else {
            // ce n'est pas un onduleur "officiel", on l'édite, met à jour directement
            var answer = confirm(findText('This transformer already exists') + '. ' + findText('Are you sure you want to update it (this will impact all your projects with this transformer)?'));
            if (answer) { // YES
                transformer.uid = uidtransfo;
                var datasend = 'actionBDD=updateTransformer&transformer=' + JSON.stringify(transformer);

                //console.log("edit transformer ", datasend);
                $.ajax({
                    type: "POST",
                    url: './ajax/requetes.php5',
                    data: datasend,
                    success: function (msg) {
                        //console.log("success edit transformer", msg);
                        alert(msg);
                        updateTransformersList();
                    }
                });
            }
        }
    }
}

function deleteTransformer() {
    clic_on_button("edit_database_deleteTransformer", 0, 0, userid);
    var accessDatabase = moduleVerify("edit_database", 0, true);
    if (accessDatabase.valide) {
        if ($('#userchoice_transformer').val() != null) {
            var uidtransformer = $('#userchoice_transformer').val();
            var creator = "1"; // par défaut officielle
            var datasend = 'actionBDD=findCreatorTransformer&uidtransformer=' + uidtransformer;

            $.ajaxSetup({ async: false });
            $.ajax({
                type: "POST",
                url: './ajax/requetes.php5',
                data: datasend,
                success: function (msg) {
                    //console.log("success creator transformer: ", msg);
                    creator = msg;
                }
            });

            if (creator == "1") {
                alert(findText('This transformer is part of the official database Archelios') + '. ' + findText('This transformer can not be deleted') + '.');
            }
            else {
                var answer = confirm($('#userchoice_transformer option:selected').text() + ": " + findText('Do you really want to delete this transformer?') + ' ' + findText('This option will affect all your projects with this transformer.') + ' ' + findText('Irrevocable option.'));
                if (answer) { // YES
                    var datasend = 'actionBDD=deleteTransformer&uidtransformer=' + uidtransformer;

                    $.ajax({
                        type: "POST",
                        url: './ajax/requetes.php5',
                        data: datasend,
                        success: function (msg) {
                            //console.log("success delete battery", msg);
                            alert(msg);
                            updateTransformersList();
                        }
                    });
                }
            }
        }
    }
}

// #8361 Ne pas mettre l'étoile au moment de l'ajout
function getNameWithoutFavoriteIcon(name) {
    //var favoriteIconHtml = '&#9733; '; // encodage html pour l'étoile des favoris -> ne fonctionne pas au search !
    var favoriteIconCharacters = '★ ';
    let position = name.search(favoriteIconCharacters);
    if (position == 0) {
        name = name.substring(2); // 2 car contient étoile + espace
    }
    return name;
}

function seeCharacteristics(uid_product, type, edit, oData/*#4857*/, bFromDataBase) // NO 68
{
    var trace = 0;
    if (trace) console.log("seeCharacteristics");
    if (type == "mod") {
        var mod = null;
        //$('#manu_mod').text($("#manufacturer_module option:selected").text());
        if (uid_product != null) {
            mod = findModule(uid_product);
        } else if (oData != null) {
            mod = oData;
        }
        else { // #540 : pour l'ajout de module, on doit récupérer le nom du fabricant
            // #8361 Ne pas mettre l'étoile au moment de l'ajout
            $('#manu_mod').text(getNameWithoutFavoriteIcon($("#manufacturer_module option:selected").text()));
        }

        if (mod != null) {
            $('#manu_mod').text(mod.module_manufacturer); // suite au NO 548
            $('#uid_mod').text(mod.UID); // #6948
            $('#nameMod').val(mod.name);
            $('#typeMod').val(mod.celltype);
            $('#nbCellsMod').val(mod.nb_cells);
            $('#bifacialMod').val(mod.bifacial);
            $('#bifacialityFactorMod').val(mod.bifaciality_factor); // #3833
            $('#PstcMod').val(mod.nominal_power);
            $('#UocMod').val(mod.Uoc);
            $('#IscMod').val(mod.Isc);
            $('#UmppMod').val(mod.Umpp);
            $('#ImppMod').val(mod.Impp);
            $('#NOCTMod').val(mod.noct);
            $('#PTempMod').val(mod.coefficient_power);
            $('#ITempMod').val(mod.coefficient_current);
            $('#VTempMod').val(mod.coefficient_voltage);

            $('#lengthMod').val(mod.length);
            $('#widthMod').val(mod.width);
            $('#thicknessMod').val(mod.thickness);
            $('#weightMod').val(mod.weight);

            $('#RshMod').val(mod.module_Rsh);
            $('#RsMod').val(mod.module_Rs);
            $('#IoMod').val(mod.module_Io);
            $('#IphMod').val(mod.module_Iph);
            $('#diode_ideality_factorMod').val(mod.diode_ideality_factor); // #5486

            $('#IrmMod').val(mod.Irm); // #217
            $('#VmaxMod').val(mod.Vmax);
            $('#obsoleteMod').val(mod.obsolete); // #7221
        }
        if (edit)
            $('.charactmod').prop('disabled', false);
        else
            $('.charactmod').prop('disabled', true);

        $('#characteristicsModuleModal').modal('show');
    }
    else if (type == "inv") {
        var oInvListWithMPPTA = null;//#4857
        if (uid_product != null) {
            //var inv = findInverter(uid_product);
            var oInvListWithMPPTA = findInverterAndMPPT(uid_product); // #4614 : remplacer findInverter par findInverterAndMPPT
        }
        else if (oData != null) {//#4857
            oInvListWithMPPTA = oData;//#4857
        } else {// #540 :
            $('#manu_inv').text(getNameWithoutFavoriteIcon($("#manufacturer_inverter option:selected").text()));
            $('.forMPPT').prop('disabled', false); // seul moment où on autorise l'édition du nb de MPPT c'est à la création d'un onduleur
        }

        var bDisableNbMPPT = false, sTxtDisableNbMPPT = ""; //#4937 éditable par défaut
        if (oInvListWithMPPTA != null && oInvListWithMPPTA.length > 0) {
            // le premier élément de la liste est l'onduleur général
            var inv = oInvListWithMPPTA[0];
            $('#nameInv').val(inv.name);
            $('#PstcInv').val(inv.nominal_power);
            $('#PmaxInv').val(inv.Pmax);
            $('#PmaxACInv').val(inv.PmaxAC); // #5020
            $('#VminInv').val(inv.Vmin);
            $('#VmaxInv').val(inv.Vmax);
            $('#MaxInputVInv').val(inv.MaxInputV);  // NO 605 : vraie tension max de l'onduleur
            $('#ImaxInv').val(inv.Imax);
            $('#Icc_maxInv').val(inv.Icc_max == "-1" ? "" : inv.Icc_max); // #6343 : -1 par défaut donc si -1, on n'affiche vide
            $('#MaxEffInv').val(inv.efficiency);
            $('#EuroEffInv').val(inv.european_efficiency);
            $('#CostInv').val(inv.cost_unit);
            $('#ProtectionInv').val(inv.protection_type);
            $('#EntriesInv').val(inv.nb_entries);
            $('#NominalVoltageInv').val(inv.nominal_voltage);
            $('#LengthInv').val(inv.length);
            $('#WidthInv').val(inv.width);
            $('#HeightInv').val(inv.height);
            $('#TypeConnectingInv').val(inv.connection_type);
            $('#VoltageACInv').val(inv.voltageAC);
            $('#CurrentACInv').val(inv.currentAC);
            $('#CosPhiInv').val(inv.cosPhi);
            $('#manu_inv').text(inv.inv_manufacturer);
            $('#uid_inv').text(inv.UID); // #6948

            $('#SC_RF_CEI_62109Inv').val(inv.SC_RF_CEI_62109);
            if (inv.inv_transfo == "1") // pour valuer le select (car unification ajout/visu, la valeur du select est oui/non et pas0/1)
                $('#transfoInv').val("oui").change();
            else
                $('#transfoInv').val("non").change();

            $('#obsoleteInv').val(inv.obsolete); // #7221

            if (oInvListWithMPPTA.length > 1) {
                var nbMPPT = oInvListWithMPPTA.length - 1;
                $('#nbMPPTInv').val(nbMPPT);
                updateNumberOfMPPT();
                if (nbMPPT >= 2) {
                    for (var m = 1; m < oInvListWithMPPTA.length; m++) {
                        $('#ImaxMPPT' + (m - 1)).val(oInvListWithMPPTA[m].Imax);
                        $('#Icc_maxMPPT' + (m - 1)).val(oInvListWithMPPTA[m].Icc_max == "-1" ? "" : oInvListWithMPPTA[m].Icc_max); // #6343 : -1 par défaut donc si -1, on n'affiche vide
                        $('#nbEntriesMPPT' + (m - 1)).val(oInvListWithMPPTA[m].nb_entries);
                    }
                }
            }
            else {
                //#4937 : si c'est un MPPT, on ne permet pas d'éditer le nombre de MPPT, sinon pb
                if (inv.name.search(" MPPT ") != -1) { // c'est un MPPT
                    bDisableNbMPPT = true;
                    sTxtDisableNbMPPT = findText("This value is disable because it is already a MPPT.");
                }

                $('#nbMPPTInv').val(1);
                updateNumberOfMPPT();//#4857 // créer les lignes ou cacher la div -> #4976 : mettre l'appel à la fonction ici
            }
            // à l'édition : on ne permet pas de changer le nombre de MPPT
            // si on veut supprimer des MPPT, on les supprime un par un, si on veut en ajouter, on recréé un onduleur : évite de la gestion trop compliquée
            //$('.forMPPT').prop('disabled', true); // toujours grisé même quand on édite
        }

        if (edit) {
            $('.charactinv:not(.forMPPT)').prop('disabled', false);
            $('#nbMPPTInv').prop('disabled', bDisableNbMPPT).attr('title', sTxtDisableNbMPPT);
        }
        else
            $('.charactinv').prop('disabled', true);

        $('#characteristicsInverterModal').modal('show');
    }
    else if (type == "optimizer") {
        if (uid_product != null) {
            var optimizer = findOptimizer(uid_product);

            $('#nameOpt').val(optimizer.name);
            $('#PstcOpt').val(optimizer.nominal_power);
            $('#VminOpt').val(optimizer.Vmin);
            $('#VmaxOpt').val(optimizer.Vmax);
            $('#MaxInputVOpt').val(optimizer.MaxInputV);
            $('#ImaxOpt').val(optimizer.Imax);
            $('#MaxEffOpt').val(optimizer.efficiency);
            $('#EuroEffOpt').val(optimizer.european_efficiency);
            $('#ProtectionOpt').val(optimizer.protection_type);
            $('#LengthOpt').val(optimizer.length);
            $('#WidthOpt').val(optimizer.width);
            $('#HeightOpt').val(optimizer.height);
            $('#VoltageOutputMaxOpt').val(optimizer.voltage_output_max);
            $('#CurrentOutputMaxOpt').val(optimizer.current_output_max);
            $('#manu_opt').text(optimizer.opt_manufacturer);
            $('#uid_opt').text(optimizer.UID); // #6948
            $('#SC_RF_CEI_62109Opt').val(optimizer.SC_RF_CEI_62109);
            $('#obsoleteOpt').val(optimizer.obsolete); // #7221
        }
        else { // si aucun optimiseur encore dans ce fabricant, on permet quand même l'ouverture de la fenêtre
            // on récupère le fabricant
            if (checkIfDatabasePage())
                $('#manu_opt').text(getNameWithoutFavoriteIcon($("#manufacturer_optimizer option:selected").text()));
            else
                $('#manu_inv').text(getNameWithoutFavoriteIcon($("#manufacturer_inverter option:selected").text()));
        }

        if (edit)
            $('.charactopt').prop('disabled', false);
        else
            $('.charactopt').prop('disabled', true);

        $('#characteristicsOptimizerModal').modal('show');
    }
    else if (type == "meteo") {
        trace = 0;
        var meteo = findMeteo(uid_product);


        if (typeof jsonContentForMasks != "undefined") {
            var oLocalization = jsonContentForMasks.localisation,
                oMeteo = jsonContentForMasks.meteo,
                oSite = jsonContentForMasks.site;

            if (meteo.latitude === null) {
                meteo.latitude = parseFloat(oLocalization.lat).toFixed(3);
                meteo.climate = oMeteo.climate;
            }

            if (meteo.longitude === null) {
                meteo.longitude = parseFloat(oLocalization.long).toFixed(3);
            }

            if (meteo.altitude === null) {
                meteo.altitude = oSite.altitude;
            }

            if (meteo.name === null) {
                meteo.name = '';
            }

            if (meteo.m_GMTOffset === null) {
                meteo.m_GMTOffset = oMeteo.m_GMTOffset;
            }
        }

        if (trace) console.log(meteo);
        $('#nameMeteo').val(meteo.name);

        meteo.country = '--';
        $('#countryMeteo').val(meteo.country);
        $('#latitudeMeteo').val(meteo.latitude);
        $('#climateMeteo').val(meteo.climate);
        $('#longitudeMeteo').val(meteo.longitude);
        $('#altitudeMeteo').val(meteo.altitude);
        $('#timezoneMeteo').val(meteo.m_GMTOffset);

        if (edit)
            $('.charactmeteo').prop('disabled', false);
        else
            $('.charactmeteo').prop('disabled', true);


        $('#commentsMeteo').val(getAndTradMeteoComments(meteo.comments));
        //#6389
        $('#mainWindows').val("");
        if (bFromDataBase) {
            $('#mainWindows').val("database");
        }



        $('#characteristicsMeteoModal').modal('show');
    }
    else if (type == "battery") {
        trace = 0;
        if (uid_product != null) {
            var battery = findBattery(uid_product);
            if (trace) console.log(battery);
            $('#nameBat').val(battery.name);
            $('#label_manu_battery').val(battery.manufacturer);
            $('#TypeBat').val(battery.type);
            $('#VoltageBat').val(battery.voltage_element);
            $('#CapacityBat').val(battery.capacity_element);
            $('#FaradicEficiencyBat').val(battery.faradic_efficiency);
            $('#UnloadDeepnessBat').val(battery.unload_deepness);
            $('#MonthSelfunloadingBat').val(battery.month_self_unloading);
            $('#NumberCyclesBat').val(battery.number_cycles);
            //$('#CostBat').val(battery.unit_cost);
            $('#LifetimeBat').val(battery.lifetime);
            $('#VolumeBat').val(battery.volume);
            $('#WeightBat').val(battery.weight);
            $('#obsoleteBat').val(battery.obsolete); // #7221
        }
        else // pour l'ajout, on doit récupérer le nom du fabricant
            $('#label_manu_battery').text(getNameWithoutFavoriteIcon($("#manufacturer_battery option:selected").text()));

        if (edit)
            $('.charactbat').prop('disabled', false);
        else
            $('.charactbat').prop('disabled', true);

        $('#characteristicsBatteryModal').modal('show');
    }
    else if (type == "transformer") {
        trace = 0;
        if (uid_product != null) {
            var transformer = findTransformer(uid_product);
            if (trace) console.log(transformer);

            $('#nameTransfo').val(transformer.name);
            //$('#label_manu_battery').val(battery.manufacturer);
            $('#manuTransfo').val(transformer.manufacturer);
            $('#VoltageLVTransfo').val(transformer.voltage_LV);
            $('#VoltageHVTransfo').val(transformer.voltage_HV);
            $('#NbLVWindingsTransfo').val(transformer.nb_LV_Coils);
            $('#WindingConnectionTransfo').val(transformer.winding_type);
            $('#RatedPowerTransfo').val(transformer.ratedPower);
            $('#Efficiency100Transfo').val(transformer.efficiency_100);
            $('#Efficiency75Transfo').val(transformer.efficiency_75);
            $('#NoLoadLossesTransfo').val(transformer.no_load_losses);
            $('#FullLoadLossesTransfo').val(transformer.full_load_losses);
            $('#UccTransfo').val(transformer.ucc);
        }
        else {// pour l'ajout, on doit récupérer le nom du fabricant
            $('#manuTransfo').val($("#manufacturer_transformer").val());
            //$('#label_manu_transformer').text($("#manufacturer_transformer option:selected").text());
            $('#nameTransfo').val(); // on met la référence à vide, sinon peut afficher celle sélectionnée précédemment
        }


        if (edit)
            $('.characttransfo').prop('disabled', false);
        else
            $('.characttransfo').prop('disabled', true);

        $('#characteristicsTransformerModal').modal('show');
    }
}

function getAndTradMeteoComments(comments) {
    if (comments != null) {
        if (comments == "add manually") {
            return findText(comments);
        }
        else {
            //var commentsTrad = comments.replace("Données MeteoNorm issues des bases de ", "TOTO");
            //le replace avec accent ne fonctionne pas !!
            var pos = comments.lastIndexOf("Cythelia,");
            if (pos >= 0) {
                var commentsTrad = comments.replace(comments.substr(0, pos + 10), findText("Meteonorm data from data bases Cythelia, "));
                return commentsTrad;
            }
        }
    }

    return comments;
}



function seeCharacteristicsModuleSelect(modSelect) { // NO 115
    $('#btn_addmodule').hide();
    $('#btn_editmodule').hide();

    //NO 548 cacher les boutons d'ajout et d'édition
    var modSelect = modSelect || $('#module').val();

    if (typeof g_oUIBim != "undefined" && g_oUIBim.isActive()) {//#2510
        modSelect = g_oUIBim.getModuleUuid();
    }
    //console.log("seeCharacteristicsModuleSelect : ", modSelect);
    if (modSelect != null)
        seeCharacteristics(modSelect, "mod", 0);

    $("#testProgress").trigger("seeCharacteristicsModuleSelect");

    if (modSelect != null)
        seeCharacteristics(modSelect, "mod", 0);

    $("#testProgress").trigger("seeCharacteristicsModuleSelect");

    // #6398
    var selectAsterix = document.getElementById("select2-module-container")
    // correction rapide avant release :
    // on teste l'existance de select2-module-container car n'existe pas dans un projet (si on veut voir directement les caractéristiques sans aller dans le wizard - directement depuis l'arbre)
    if (typeof selectAsterix != "undefined" && selectAsterix != null) {
        if (selectAsterix.textContent.startsWith("*")) {
            $("#nameMod").val("* " + $('#nameMod').val());
        }
    }
}

function seeCharacteristicsInverterSelect(edit, invSelect) // NO 115
{
    var edit = edit || 0;
    if (edit == 0) {
        $('#btn_addinverter').hide();
        $('#btn_editinverter').hide();
    }

    //console.log ($onduleur);
    //NO 548 cacher les boutons d'ajout et d'édition

    if ($onduleur != null && $("#choiceconfigradio_auto").prop("checked")) {
        var invSelect = invSelect || $onduleur.val();
        if (invSelect != null) {
            var value = String(invSelect);
            var nbval = value.search(","); //on cherche s'il y a plusieurs options sélectionnées
            if (nbval == -1) // pas de multiples options
                seeCharacteristics(invSelect, "inv", edit);
            else
                alert(findText("Please select one inverter to see his characteristics"));
        }
    }
    else { // NO 690 si les config sont manuelles, on prend l'onduleur sélectionné manuellement (n'est affiché que là en plus si l'utilisateur a fait une erreur ...)
        var invSelect = invSelect || String($("#userchoice_inverter").val());
        if (invSelect != "")
            seeCharacteristics(invSelect, "inv", edit);
        else {
            alert(findText("Please select one inverter in the list"));
            return;
        }
    }
    $("#testProgress").trigger("seeCharacteristicsInverterSelect");
}

function seeCharacteristicsOptimizerSelect(edit, optSelect) { // #8003
    var edit = edit || 0;
    if (edit == 0) {
        $('#btn_addoptimizer').hide();
        $('#btn_editoptimizer').hide();
    }

    var optSelect = optSelect || String($('#optimizer').val());
    if (optSelect == "undefined") // on est dans un projet, pas de type of car String(val) avant
        optSelect = String($('#select_optimizers').val()); // on prend le bon id du select des optimiseurs

    if (optSelect != null)
        seeCharacteristics(optSelect, "optimizer", edit);
}

function seeCharacteristicsBatterySelect(edit) { // NO 467
    var edit = edit || 0;
    if (edit == 0) {
        $('#btn_addbattery').hide();
        $('#btn_editbattery').hide();
    }
    if ($('#battery').val() != null)
        seeCharacteristics($('#battery').val(), "battery", edit);
    $("#testProgress").trigger("seeCharacteristicsBatterySelect");
}

function seeCharacteristicsTransformerSelect(edit, transfoSelect) { // NO 467
    var edit = edit || 0;
    if (edit == 0) {
        $('#btn_addtransformer').hide();
        $('#btn_edittransformer').hide();
    }
    var transfoSelect = transfoSelect || $('#choose_userchoice_transformer').val();
    if (transfoSelect != null)
        seeCharacteristics(transfoSelect, "transformer", edit);
}

var upsertViewModCharacteristics = function (mod) {
    var trace = 0;
    if (trace) console.log("seeModCharacteristics");
    if (mod) {
        if (trace) console.log(mod);
        $('#manu_mod').text(mod.module_manufacturer); // suite au NO 548
        $('#nameMod').val(mod.name);
        $('#typeMod').val(mod.celltype);
        $('#nbCellsMod').val(mod.nb_cells);
        $('#bifacialMod').val(mod.bifacial);
        $('#bifacialityFactorMod').val(mod.bifaciality_factor); // #3833
        $('#PstcMod').val(mod.nominal_power);
        $('#UocMod').val(mod.Uoc);
        $('#IscMod').val(mod.Isc);
        $('#UmppMod').val(mod.Umpp);
        $('#ImppMod').val(mod.Impp);
        $('#NOCTMod').val(mod.noct);
        $('#PTempMod').val(mod.coefficient_power);
        $('#ITempMod').val(mod.coefficient_current);
        $('#VTempMod').val(mod.coefficient_voltage);

        $('#lengthMod').val(mod.length);
        $('#widthMod').val(mod.width);
        $('#thicknessMod').val(mod.thickness);
        $('#weightMod').val(mod.weight);

        $('#RshMod').val(mod.module_Rsh);
        $('#RsMod').val(mod.module_Rs);
        $('#IoMod').val(mod.module_Io);
        $('#IphMod').val(mod.module_Iph);
        $('#diode_ideality_factorMod').val(mod.diode_ideality_factor); // #5486

        $('#IrmMod').val(mod.Irm); // #217
        $('#VmaxMod').val(mod.Vmax);
        $('#obsoleteMod').val(mod.obsolete); // #7221
    }

    $('#manu_mod').text($("#manufacturer_module option:selected").text());
    $('.charactmod').prop('disabled', false);

    $('#characteristicsModuleModal').modal('show');
};

function findModule(uid_module) {
    var oModule;

    var trace = 0;
    if (trace) console.log("findModule " + uid_module);// # NO 455

    $.ajaxSetup({ async: false }); // mettre en mode synchrone pour bien attendre la réponse afin de faire suite
    if (typeof g_oUIBim != "undefined" && uid_module.indexOf("bim-") == 0 || uid_module.indexOf(" :-: ") >= 0) {//#1811
        oModule = g_oUIBim.findModule(uid_module);
        if (oModule == null) {
            //#2356
            $("html,body").css("cursor", "default");
            PopupMessage("", 0, "");
            $("#modalErrorBimAndCo").hide();
            bootbox.dialog({
                message: $("#bimCoConnectContent").html(),
                title: "Bim&CO", // calcul uniquement des modules n'ayant pas déjà une irradiation
                closeButton: false,
                buttons: {
                    success: {
                        label: findText("Log In"),
                        className: "btn-primary",
                        callback: function () {
                            var bRes = null;
                            var jModal = $('.bootbox.modal');
                            $("#bimAndCoLogin").val(jModal.find('#modalBimAndCoEmail').val());
                            $("#bimAndCoPass").val(jModal.find('#modalBimAndCoPass').val());
                            g_oUIBim.setBimAndCoAccount(function (res, sMsg) {
                                if (res) {
                                    bRes = true;
                                    window.location.reload();
                                } else {
                                    jModal.find('#modalBimAndCo_errorMsg').html(sMsg);
                                    jModal.find("#modalErrorBimAndCo").show();
                                    bRes = false;
                                }
                            });
                            return bRes;

                        }
                    },
                    main: {
                        label: findText("Create account"),
                        className: "btn-primary",
                        callback: function () {
                            var bRes = null;
                            var jModal = $('.bootbox.modal');
                            $("#bimAndCoLogin").val(jModal.find('#modalBimAndCoEmail').val());
                            $("#bimAndCoPass").val(jModal.find('#modalBimAndCoPass').val());
                            $("#checkbox_ThermsbimAndCo").prop('checked', jModal.find("#modalBimCoCheck").prop('checked'));
                            g_oUIBim.createBimAndCoAccount(function (res, sMsg) {
                                if (res) {
                                    bRes = true;
                                    window.location.reload();
                                } else {
                                    jModal.find('#modalBimAndCo_errorMsg').html(sMsg);
                                    jModal.find("modalErrorBimAndCo").show();
                                    bRes = false;
                                }
                            });
                            return bRes;
                        }
                    },
                    cancel: {
                        label: findText("Cancel"),
                        className: "",
                        callback: function () {
                            window.location.href = "./Archelios-OnlineEnglish.php#./ajax/projectsList.php";
                        }
                    }
                }
            });
        }
    } else {
        var datasend = 'action=findModule&uid_module=' + uid_module;

        if (typeof (desktop) != "undefined" && desktop && skp) {//#6145
            callRuby('callPhp', datasend);
            urlRequetes = "res.temp";
        }

        $.ajax({
            url: urlRequetes,
            dataType: 'json', // on veut un retour JSON
            data: datasend,
            success: function (mod) {
                if (trace) console.log("findModule mod ", mod);
                oModule = mod;

                // FIN # 598
            },
            error: function (msg) {
                console.log("findModule error = ", msg);
            }
        });
    }

    oModule.module_Surface = oModule.width * oModule.length / 1000000.0; // en m2
    if (oModule.noct <= 0.0)
        oModule.noct = 50.0; // comme dans le CGI

    if (typeof oModule.noct == "number")
        oModule.noct = oModule.noct.toFixed(1);

    // # 598 : ajout du test sur la techno
    oModule.m_TypeId = getTypeIdWithCellType(oModule.celltype);
    return oModule;
}

function getTypeIdWithCellType(celltype) {
    var m_TypeId = 10;

    if (celltype == "a-Si : H (single)") m_TypeId = 0;
    else if (celltype == "a-Si : H (tandem)") m_TypeId = 1;
    else if (celltype == "a-Si : H (triple)") m_TypeId = 2;
    else if (celltype == "a-Si : H micro c-Si") m_TypeId = 3; // #4647 avant : a-Si : H \/ µc-Si<
    else if (celltype == "CdTe") m_TypeId = 4;
    else if (celltype == "CIS") m_TypeId = 5;
    else if (celltype == "CSG") m_TypeId = 6;
    else if (celltype == "HIT") m_TypeId = 7;
    else if (celltype == "multicrystalline (mc-Si)") m_TypeId = 8;
    else if (celltype == "Ribbon") m_TypeId = 9;
    else if (celltype == "singlecrystalline (sc-Si)") m_TypeId = 10;

    return m_TypeId;
}

// NO 175 recherche d'un module par son nom (en cas d'import depuis ArcheliosPRO)
//-------------------------------------------------------------------------------------------
function findModulebyName(name_module) {
    var trace = 0;

    var module;
    var datasend = 'action=findModule&name_module=' + name_module;
    if (typeof (desktop) != "undefined" && desktop && skp) {//#6145
        callRuby('callPhp', datasend);
        urlRequetes = "res.temp";
    }

    if (trace) console.log("findModulebyName datasend = ", datasend);
    $.ajaxSetup({ async: false }); // mettre en mode synchrone pour bien attendre la réponse afin de faire suite
    $.ajax({
        url: urlRequetes,
        dataType: 'json', // on veut un retour JSON
        data: datasend,
        success: function (mod) {
            if (trace) console.log("findModulebyName mod " + mod.name);
            module = mod;
            module.module_Surface = module.width * module.length / 1000000.0; // en m2
            if (module.noct <= 0.0)
                module.noct = 50.0; // comme dans le CGI
            module.m_TypeId = 10;
            if (module.celltype == "a-Si : H (single)") module.m_TypeId = 0;
            if (module.celltype == "a-Si : H (tandem)") module.m_TypeId = 1;
            if (module.celltype == "a-Si : H (triple)") module.m_TypeId = 2;
            if (module.celltype == "a-Si : H micro c-Si") module.m_TypeId = 3; // #4647 avant : "a-Si : H \/ µc-Si<"
            if (module.celltype == "CdTe") module.m_TypeId = 4;
            if (module.celltype == "CIS") module.m_TypeId = 5;
            if (module.celltype == "CSG") module.m_TypeId = 6;
            if (module.celltype == "HIT") module.m_TypeId = 7;
            if (module.celltype == "multicrystalline (mc-Si)") module.m_TypeId = 8;
            if (module.celltype == "Ribbon") module.m_TypeId = 9;
            if (module.celltype == "singlecrystalline (sc-Si)") module.m_TypeId = 10;
        },
        error: function (msg) {
            console.log("findModulebyName error = ", msg);
        }
    });
    return module;
}

function findInverterbyName(name_inverter) {
    var inverter;
    var datasend = 'action=findInverter&name_inverter=' + name_inverter;
    if (typeof (desktop) != "undefined" && desktop && skp) {//#6145
        callRuby('callPhp', datasend);
        urlRequetes = "res.temp";
    }


    $.ajaxSetup({ async: false }); // mettre en mode synchrone pour bien attendre la réponse afin de faire suite
    $.ajax({
        url: urlRequetes,
        dataType: 'json', // on veut un retour JSON
        data: datasend,
        success: function (inv) {
            //console.log("findInverterbyName ", inv);
            inverter = inv;
        }
    });
    return inverter;
}

function findInverter(uid_inverter) {
    var trace = 0;
    if (trace) console.log("findInverter " + uid_inverter);// # NO 455

    var inverter;
    var datasend = 'action=findInverter&uid_inverter=' + uid_inverter;
    if (typeof (desktop) != "undefined" && desktop && skp) {//#6145
        callRuby('callPhp', datasend);
        urlRequetes = "res.temp";
    }


    $.ajaxSetup({ async: false }); // mettre en mode synchrone pour bien attendre la réponse afin de faire suite
    $.ajax({
        type: 'GET',
        url: urlRequetes,
        dataType: 'json', // on veut un retour JSON
        data: datasend,
        success: function (inv) {
            //console.log("inv"+inv);
            inverter = inv;
        }
    });
    return inverter;
}

function findInverterAndMPPT(uid_inverter) {
    var arrInverterAndMPPT = [];
    var datasend = 'action=findInverterAndMPPT&uid_inverter=' + uid_inverter;
    $.ajaxSetup({ async: false }); // mettre en mode synchrone pour bien attendre la réponse afin de faire suite
    $.ajax({
        type: 'GET',
        url: urlRequetes,
        dataType: 'json', // on veut un retour JSON
        data: datasend,
        success: function (json) {
            //le json de réponse contient l'onduleur sélectionné en 1er puis ses MPPT (s'il y en a)
            //console.log("json findInverterAndMPPT = ", json);

            // #4688 résoudre Pb d'affichage et d'ajout si nb MPPT >= 10 , si pas >= 10 : inutile
            if (json.length >= 10) {
                // on trie le tableau en splittant sur le numéro de MPPT afin de faire le tri en fonction des nombres et non juste ordre alphabétique
                json.sort(function (a, b) {
                    if (a.name.search("MPPT") != -1 && b.name.search("MPPT") != -1) { // on compare que si MPPT dans le nom (sinon veut dire qu'il n'y a pas de MPPT, c'est l'onduleur parent
                        var iNumMPPTA = parseInt(a.name.substr(a.name.lastIndexOf("MPPT ") + 5)); // +5 = nb de caractère dans MPPT (avec espace)
                        var iNumMPPTB = parseInt(b.name.substr(b.name.lastIndexOf("MPPT ") + 5)); // +5 = nb de caractère dans MPPT (avec espace)
                        return iNumMPPTA - iNumMPPTB;
                    } else
                        return 0; // on laisse tel quel
                });
            }

            arrInverterAndMPPT = json;
        }
    });
    return arrInverterAndMPPT;
}

// renvoie true si le nom existe déjà, false sinon
function checkIfInverterNameAlreadyExists(nameToCheck, uidinverter) {
    var bInverterNameAlreadyExists = true;
    $.ajaxSetup({ async: false });
    var datasend = 'actionBDD=checkIfInverterNameAlreadyExists&name=' + nameToCheck + '&exceptuid=' + uidinverter;
    $.ajax({
        type: "POST",
        url: urlRequetes,
        data: datasend,
        success: function (ret) {
            console.log("success checkIfInverterNameAlreadyExists : ", ret);
            bInverterNameAlreadyExists = (ret == "true"); // transforme la chaine de caractère de retour en booléen
        }
    });
    return bInverterNameAlreadyExists;
}

// #8003
function findOptimizer(uid_optimizer) {
    var optimizer;
    var datasend = 'action=findOptimizer&uid_optimizer=' + uid_optimizer;
    if (typeof (desktop) != "undefined" && desktop && skp) {//#6145
        callRuby('callPhp', datasend);
        urlRequetes = "res.temp";
    }


    $.ajaxSetup({ async: false }); // mettre en mode synchrone pour bien attendre la réponse afin de faire suite
    $.ajax({
        type: 'GET',
        url: urlRequetes,
        dataType: 'json', // on veut un retour JSON
        data: datasend,
        success: function (opti) {
            //console.log("opti", opti);
            optimizer = opti;
        }
    });
    return optimizer;
}

function findBattery(uid) {
    var battery;
    var datasend = 'action=findBattery&uid_battery=' + uid;

    //console.log(datasend);
    $.ajaxSetup({ async: false });
    $.ajax({
        type: "GET",
        url: 'ajax/requetes.php5',
        data: datasend,
        dataType: 'json',
        success: function (json) {
            battery = json;
            //console.log("success battery : ", battery);
        },
        error: function () { // msg,stat, settings
            console.log("battery error");
        }
    });
    return battery;
}

function findTransformer(uid) {
    var transformer;
    var datasend = 'action=findTransformer&uid_transformer=' + uid;

    //console.log(datasend);
    $.ajaxSetup({ async: false });
    $.ajax({
        type: "GET",
        url: 'ajax/requetes.php5',
        data: datasend,
        dataType: 'json',
        success: function (json) {
            transformer = json;
            //console.log("success transformer : ", transformer);
        },
        error: function () { // msg,stat, settings
            console.log("transformer error");
        }
    });
    return transformer;
}

//#6085 : consultation, édition et suppression des météos dans le menu BDD
function seeCharacteristicsMeteoSelect(edit) // NO 458
{
    var edit = edit || 0;
    if (edit == 0) {
        $('#btn_addmeteo').hide();
        $('#div_importWeatherFiles').hide(); // NO 855: remplacer du bouton par dropdown menu //$('#btn_importPVGismeteo').hide();
        $('#btn_editmeteo').hide();
    }
    //console.log("seeCharacteristicsMeteoSelect: ", $('#select_meteo').val());
    if ($('#select_meteo').val() != null) {
        var res = $('#select_meteo').val().split("!");
        if (res.length > 0)
            seeCharacteristics(res[0], "meteo", edit);
    }
}

function findMeteo(uidmeteo) {
    var meteo;
    var datasend = 'meteo_choice=' + new Date().getTime() + '&uidmeteo=' + uidmeteo;

    //console.log(datasend);
    $.ajaxSetup({ async: false });
    $.ajax({
        type: "POST",
        url: 'ajax/requetes.php5',
        data: datasend,
        dataType: 'json',
        success: function (json) {
            meteo = json;
            //console.log("success meteo : ", meteo);
        },
        error: function (e) { // msg,stat, settings
            console.log("meteo error");
            console.log(e.message);
        }
    });
    return meteo;
}

var meteoUpdate = {};
//NO 451 ajout nouveau matériel
function addMeteo(bFromDataBase) {
    document.getElementById("fileImportMeteo_Arch").value = "";
    document.getElementById("fileImportPVGis").value = "";
    document.getElementById("fileImportTMY_NRELv3").value = "";
    document.getElementById("fileImportTMY_PVSyst").value = "";
    document.getElementById("fileImportTMY_3E").value = "";
    document.getElementById("fileImportTMY_PVGis").value = "";
    document.getElementById("fileImportTMY_Helioclim_PVSyst").value = "";
    document.getElementById("fileImportTMY_Helioclim_NRELv3").value = "";
    document.getElementById("fileImportTMY_Solargis").value = "";
    document.getElementById("fileImportTMY_Solargis3").value = "";
    document.getElementById("fileImportMonth_Solargis").value = "";

    if (typeof bFromDataBase == "undefined")//#6389
        bFromDataBase = false;
    /*if (accessPRO != "1"){ // NO 1207
        alert(findText("This feature is only available with a PRO version.")+"\n"+findText("You can access to this feature by buying Archelios PRO."));
        return;
    }*/
    clic_on_button('online_add_weather', 0);
    //#5084
    var accessFeature = moduleVerify("edit_database_weather", 0, true);
    if (!accessFeature.valide) {
        return;
    }

    $('#btn_addmeteo').show();
    $('#div_importWeatherFiles').show(); // NO 855: remplacer du bouton par dropdown menu //$('#btn_importPVGismeteo').show();
    $('#btn_editmeteo').hide();
    $('#bAddMeteo').val("true");
    seeCharacteristics(null, "meteo", 1, null, bFromDataBase);
}
function testMeteoValues() {
    var invalidvalue = findText("Invalid value for");

    if ($('#countryMeteo').val() == "") {
        alert(invalidvalue + " " + $('#lab_characmeteo_country').text());
        return -1;
    }
    if ($('#latitudeMeteo').val() == "" || isNaN($('#latitudeMeteo').val())) {
        alert(invalidvalue + " " + $('#lab_characmeteo_lat').text());
        return -1;
    }
    if ($('#longitudeMeteo').val() == "" || isNaN($('#longitudeMeteo').val())) {
        alert(invalidvalue + " " + $('#lab_characmeteo_long').text());
        return -1;
    }
    if ($('#altitudeMeteo').val() == "" || isNaN($('#altitudeMeteo').val())) {
        alert(invalidvalue + " " + $('#lab_characmeteo_altitude').text());
        return -1;
    }
    if ($('#timezoneMeteo').val() == "" || isNaN($('#timezoneMeteo').val()) || $('#timezoneMeteo').val() < -12 || $('#timezoneMeteo').val() > 13) {
        alert(invalidvalue + " " + $('#lab_characmeteo_timezone').text());
        return -1;
    }
    if ($('#climateMeteo').val() == null) {
        alert(findText("Missing climate of meteo station"));
        return -1;
    }

}

function getMeteoFromCharacteristics() {
    var meteo = {
        "country": $('#countryMeteo').val(),
        "latitude": $('#latitudeMeteo').val(),
        "longitude": $('#longitudeMeteo').val(),
        "altitude": $('#altitudeMeteo').val(),
        "m_GMTOffset": $('#timezoneMeteo').val(),
        "climate": $('#climateMeteo').val(),
        "source": $('#commentsMeteo').val() //#5607
    };
    //pour les valeurs mensuelles/annuelles, graphiques :
    meteo.directmensuel = meteoUpdate.directmensuel;
    meteo.diffusmensuel = meteoUpdate.diffusmensuel;
    meteo.solarfraction = meteoUpdate.solarfraction;
    meteo.vitessevent = meteoUpdate.vitessevent;
    meteo.temperature = meteoUpdate.temperature;
    meteo.linktrouble = meteoUpdate.linktrouble;
    meteo.typicalyear = meteoUpdate.typicalyear;
    //meteo.source = meteoUpdate.source; //#5607

    return meteo;
}


/** Import PVGis meteo data */
function importPVGis_Meteo() {
    /*var accessPRO = clic_on_button('online_addmeteo_pvgis',0);
    if (accessPRO != "1"){
        alert(findText("This feature is only available with a PRO version.")+"\n"+findText("You can access to this feature by buying Archelios PRO."));
        return;
    }*/
    clic_on_button('importPVGis_Meteo', 0);
    //#5084
    var accessFeature = moduleVerify("edit_database_weather", 0, true);
    if (!accessFeature.valide) {
        return;
    }
    var txt1 = findText('Please select the type of climate before PVGis import') + '. ' + findText("Some parameters can be filled by default with the selected climate (if missing data in the original file).");//NO 849 : ajout précision
    var txt2 = findText('is the climate station ?');
    var txtfinal = txt1 + "<br><b>" + $('#climateMeteo option:selected').text() + "</b> " + txt2;

    /*var answer = confirm (txtfinal);
        if(answer) {*/
    // on passe par bootbox sinon ne veut plus ouvrir le dialogue sur Chrome ...
    bootbox.confirm({
        message: txtfinal,
        buttons: {
            confirm: {
                label: findText('Validate'),//#6234
                className: 'btn-primary'
            },
            cancel: {
                label: findText('Cancel'),//#6234
                className: 'btn-default'
            }
        },
        callback: function (result) {
            if (result) { // si OK
                $('#fileImportPVGis').trigger('click');
            }
        }
    });

    //}
}
function displayApi3E() {
    $('#loadingApi3E').show();
    $('#waitingMsgAPi3E').show();
    $('#msgAPi3EError').hide();
}
function displayApiSolargis() {
    $('#loadingApiSolargis').show();
    $('#waitingMsgAPiSolargis').show();
    $('#msgAPiSolargisError').hide();
}
function displayDivApi3E() {
    $('#divloadingAPI3E').show()
}
function displayDivApiSolargis() {
    $('#divloadingAPISolargis').show()
}
function popUpImportTMY_3E_MeteoApi() {
    /*$('#closePopUpApi3E').click(function(){            
        $('#div_importTMY_3E_MeteoApi').toggleClass('close');
    });*/
    var msgDialog = '<div class="row" id="connectToApi3E">  ' +
        '<div class="col-lg-7 form-inline API3E">' +
        '<label>' + findText("Enter Key 3E API") + '</label>' +
        '<input type="text" id="inputAPI_3E">'
        + '<div id="divloadingAPI3E" style="display:none;">' + '<i class="fa fa-spinner fa-spin" id ="loadingApi3E">' + '</i>' + '<span id = "waitingMsgAPi3E">' + '&nbsp;' + findText("Loading data, it may take 1-2 minutes") + '</span>' + '<span id = "msgAPi3EError" style="display:none;color: red;">' + '</span>' + '</div>' +
        '</div>';

    let boxApi3E = bootbox.dialog({
        message: msgDialog,
        title: findText("Connection to the 3E API"),

        closeButton: false,
        buttons: {

            cancel: {
                label: findText("Cancel"),
                className: "btn-default btn3E",
                callback: function () {
                }
            },
            success: {

                label: findText("Validate"),
                className: "btn-primary success btn3E",
                callback: function () {
                    if (($('#loadingApi3E').is(":visible") == false) && ($('#waitingMsgAPi3E').is(":visible") == false) && ($('#msgAPi3EError').is(":visible") == true)) {
                        setTimeout(displayApi3E(), 400);
                    }
                    setTimeout(displayDivApi3E(), 400);
                    var inputKeyApi = $('#inputAPI_3E').val();
                    if (inputKeyApi == "" || inputKeyApi.length <= 10) {
                        alert(findText("Error Key API 3E"));
                        $('#divloadingAPI3E').hide();
                    }
                    else {
                        $('.btn3E').attr("disabled", true);
                        ImportTMY_3E_MeteoApi(boxApi3E);
                    }
                    return false;
                }
            },

        }
    });
}
function ImportTMY_3E_MeteoApi(boxApi3E) {
    var inputKeyApi = $('#inputAPI_3E').val();
    fLatitude = parseFloat($('#latitudeMeteo').val());
    fLongitude = parseFloat($('#longitudeMeteo').val());
    if (isNaN(fLatitude) || isNaN(fLongitude)) {
        alert(findText('Latitude or longitude is not valid.') + '\n' + findText('Please enter the desired coordinates for the weather station.'));
        return;
    }
    ConnectToApi3E(inputKeyApi, fLatitude, fLongitude, boxApi3E);
}

function popUpImportTMY_Solargis_MeteoApi() {

    var msgDialog = '<div class="row" id="connectToApiSolargis">  ' +
        '<div class="col-lg-7 form-inline APISolargis">' +
        '<label>' + findText("Enter Key Solargis API") + '</label>' +
        '<input type="text" id="inputAPI_Solargis">'
        + '<div id="divloadingAPISolargis" style="display:none;">' + '<i class="fa fa-spinner fa-spin" id ="loadingApiSolargis">' + '</i>' + '<span id = "waitingMsgAPiSolargis">' + '&nbsp;' + findText("Loading data, it may take several minutes") + '</span>' + '<span id = "msgAPiSolargisError" style="display:none;color: red;">' + '</span>' + '</div>' +
        '</div>';
    let boxApiSolargis = bootbox.dialog({
        message: msgDialog,
        title: findText("Connection to the Solargis API"),

        closeButton: false,
        buttons: {
            cancel: {
                label: findText("Cancel"),
                className: "btn-default btnSolargis",
                callback: function () {
                }
            },
            success: {
                label: findText("Validate"),
                className: "btn-primary success btnSolargis",
                callback: function () {
                    $('#loadingApiSolargis').show();
                    $('#waitingMsgAPiSolargis').show();
                    $('#msgAPiSolargisError').hide();
                    if (($('#loadingApiSolargis').is(":visible") == false) && ($('#waitingMsgAPiSolargis').is(":visible") == false) && ($('#msgAPi3EError').is(":visible") == true)) {
                        setTimeout(displayApiSolargis(), 400);
                    }
                    setTimeout(displayDivApiSolargis(), 400);
                    var inputKeyApi = $('#inputAPI_Solargis').val();
                    if (inputKeyApi == "" || inputKeyApi.length <= 0) {
                        alert(findText("Error Key API Solargis"));
                        $('#divloadingAPISolargis').hide();
                    }
                    else {
                        $('.btnSolargis').attr("disabled", true);
                        ImportTMY_Solargis_MeteoApi(boxApiSolargis);
                    }
                    return false;
                }
            },

        }
    });
}

function ImportTMY_Solargis_MeteoApi(boxApiSolargis) {
    var inputKeyApi = $('#inputAPI_Solargis').val();
    var projectName = $('#project_name').val();
    fLatitude = $('#latitudeMeteo').val();
    fLongitude = $('#longitudeMeteo').val();
    if (isNaN(fLatitude) || isNaN(fLongitude)) {
        alert(findText('Latitude or longitude is not valid.') + '\n' + findText('Please enter the desired coordinates for the weather station.'));
        return;
    }
    ConnectToApiSolargis(inputKeyApi, fLatitude, fLongitude, boxApiSolargis, projectName);
}


function importPVGis_MeteoApi() {
    /*var accessPRO = clic_on_button('online_addmeteo_pvgis_api',0);
    if (accessPRO != "1"){
      alert(findText("This feature is only available with a PRO version.")+"\n"+findText("You can access to this feature by buying Archelios PRO."));
      return;
    }*/
    clic_on_button('importPVGis_MeteoApi', 0);
    //#5084
    var accessFeature = moduleVerify("edit_database_weather", 0, true);
    if (!accessFeature.valide) {
        return;
    }
    var txt1 = findText('Please select the type of climate before PVGis import') + '. ' + findText("Some parameters can be filled by default with the selected climate (if missing data in the original file).");//NO 849 : ajout précision
    var txt2 = findText('is the climate station ?');
    var txtfinal = txt1 + "\n" + $('#climateMeteo option:selected').text() + " " + txt2;
    var answer = confirm(txtfinal);
    if (answer) {
        var oMeteoSrv = new OMMeteoWebSrvDriver(),
            fLatitude = parseFloat($('#latitudeMeteo').val()),
            fLongitude = parseFloat($('#longitudeMeteo').val());
        if (isNaN(fLatitude) || isNaN(fLongitude)) {
            alert(findText('Latitude or longitude is not valid.') + '\n' + findText('Please enter the desired coordinates for the weather station.'));
            return;
        }
        oMeteoSrv.setProvider(EWebProvider.PVGIS);
        oMeteoSrv.setWebMeth(EWebMeth.GET);
        oMeteoSrv.setRequestedData(ERequestedData.MonthlySolarRadiation);
        oMeteoSrv.setIrradDatabase(EIrradiationDatabase.PVGIS_SARAH);
        if (fLongitude <= -50 && fLongitude >= -175) {
            oMeteoSrv.setIrradDatabase(EIrradiationDatabase.PVGIS_NSRDB);
            oMeteoSrv.setRequestedPeriod(ERequestedPeriod["2007_2020"]); // #6728 changement période (avant : 2006_2015)
        }
        oMeteoSrv.setLatitude(fLatitude);
        oMeteoSrv.setLongitude(fLongitude);
        oMeteoSrv.call(function () {
            var sStream = oMeteoSrv.getOutStream();
            if (sStream !== null) {
                var sDataA = oMeteoSrv.convertToArray(sStream),
                    sMonthDataA = oMeteoSrv.aggregateMonthlyData(sDataA);

                oMeteoSrv.setRequestedData(ERequestedData.DailySolarRadiation);
                oMeteoSrv.call(function () {
                    sStream = oMeteoSrv.getOutStream();
                    if (sStream !== null) {
                        var sDayDataA = null, sSendDataA = null, sContent = null;
                        sDataA = oMeteoSrv.convertToArray(sStream);
                        sDayDataA = oMeteoSrv.aggregateDailyData(sDataA);
                        sSendDataA = oMeteoSrv.mergeMonthlyData(sDayDataA, sMonthDataA);
                        sContent = oMeteoSrv.convertToStream(sSendDataA);
                        var src = EWebProvider.PVGIS + " API " + oMeteoSrv.getIrradDatabase() + " " + oMeteoSrv.m_oProvider.nStartT + "-" + oMeteoSrv.m_oProvider.nEndT; // #6728 ajout de la date dans le commentaire pour ne plus avoir la question
                        updateMeteoStationFormData(sContent, EProvider.TMY_PVGis, src); // #5607
                        // depuis retour pb récupération des données, on ne récupère plus le trouble de linke sur SODA (le webservice a changé...)
                        /*oMeteoSrv.setProvider(EWebProvider.SODA);
                        oMeteoSrv.setRequestedData(ERequestedData.LinkeTurbidity);
                        oMeteoSrv.call(function(){
                            sStream = oMeteoSrv.getOutStream();
                            if(sStream !== null){
                                sDataA = oMeteoSrv.convertToArray(sStream);
                                sSendDataA = oMeteoSrv.mergeMonthlyData(sDataA, sSendDataA);
                                sContent = oMeteoSrv.convertToStream(sSendDataA);
                                updateMeteoStationFormData(sContent, EProvider.TMY_PVGis);
                            	
                                //alert("Meteo data was fetched successfully");
                            }
                        });*/
                    }
                });
            }
            else {
                alert('An error occured while retrieving meteo data');
            }
        });
    }
}

/** Import TMY meteo data */

function triggerTMYImportDlg(sCtrlId) {
    /*var accessPRO = clic_on_button('online_addmeteo_'+sCtrlId,0);
      if (accessPRO != "1"){
        alert(findText("This feature is only available with a PRO version.")+"\n"+findText("You can access to this feature by buying Archelios PRO."));
        return;
      }*/
    clic_on_button('importPVGis_MeteoApi', 0);
    //#5084
    var accessFeature = moduleVerify("edit_database_weather", 0, true);
    if (!accessFeature.valide) {
        return;
    }
    var txt1 = findText('Please select the type of climate before TMY import') + '. ' + findText("Some parameters can be filled by default with the selected climate (if missing data in the original file).");
    var txt2 = findText('is the climate station ?');
    var txtfinal = txt1 + "<br><b>" + $('#climateMeteo option:selected').text() + "</b> " + txt2;

    /*var answer = confirm (txtfinal);
    if(answer) {*/
    // on passe par bootbox sinon ne veut plus ouvrir le dialogue sur Chrome ...
    bootbox.confirm({
        message: txtfinal,
        buttons: {
            confirm: {
                label: findText('Validate'),//#6234
                className: 'btn-primary'
            },
            cancel: {
                label: findText('Cancel'),//#6234
                className: 'btn-default'
            }
        },
        callback: function (result) {
            if (result) { // si OK
                $('#' + sCtrlId).trigger('click');
            }
        }
    });
}

function _validateMeteoDataA(dataA) {
    var bRes = false;
    if (dataA && Array.isArray(dataA) && dataA.length === 12) {
        bRes = true;
        dataA.forEach(function (s) {
            if (isNaN(parseFloat(s))) {
                bRes = false;
            }
        });
    }
    return bRes;
}

/** #3980: prevent exports (meteonorm legal restrictions) */
/*function exportArch_Meteo (){
  clic_on_button("exportArch_Meteo-"+accessPRO+"-"+optionsAccess, 0, 0,userid);
  if (accessPRO != 1){
    alert(
        findText("This feature is not available in your version of Archelios PRO")+ "\n" +
            findText("You can access to this feature by buying Archelios PRO.")
        );
    return false;
  }
  else {
        var fLatitude = parseFloat($('#latitudeMeteo').val()),
                fLongitude = parseFloat($('#longitudeMeteo').val()),
          fElevation = parseFloat($('#altitudeMeteo').val());

        if(isNaN(fLatitude) || isNaN(fLongitude) || isNaN(fElevation)){
            if(
            _validateMeteoDataA(meteoUpdate.directmensuel) &&
            _validateMeteoDataA(meteoUpdate.diffusmensuel) &&
            _validateMeteoDataA(meteoUpdate.solarfraction) &&
            _validateMeteoDataA(meteoUpdate.vitessevent) &&
                    _validateMeteoDataA(meteoUpdate.temperature) &&
            _validateMeteoDataA(meteoUpdate.linktrouble)
                ){
                    var sCsv = "Latitude;" + fLatitude.toString() + ";;;;;";
                    sCsv += ("Longitude;" + fLatitude.toString() + ";;;;;");
            sCsv += ("Altitude;" + fElevation.toString() + ";;;;;");
            sCsv += ";;;;;;";
                    sCsv += "Mean values for a time period;;;;;;";
                    sCsv += "Month;Direct irradiance (kWh/m2);Diffuse irradiance (kWh/m2);Solar fraction (%);Wind speed (m/s);Air temperature (°C);Link trouble";

            downloadPrompt("Export.csv", sCsv);
                }
        }
  }

  return false;
}*/

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

//// #5607 : ajout de l'origine des données = src
function updateMeteoStationFormData(contents, eProvider, src, typicalyear) {
    var trace = 0;
    if (trace) console.log(contents);
    contents = (
        contents
            .replace(new RegExp("Mois", 'g'), "Month")
            .replace(new RegExp("Nord", 'g'), "North")
            .replace(new RegExp("Sud", 'g'), "South")
            .replace(new RegExp("Ouest", 'g'), "West")
            .replace(new RegExp("Est", 'g'), "East")
            .replace(new RegExp("Fev", 'g'), "Feb")
            .replace(new RegExp("Avr", 'g'), "Apr")
            .replace(new RegExp("Mai", 'g'), "May")
            .replace(new RegExp("Juin", 'g'), "Jun")
            .replace(new RegExp("Jui", 'g'), "Jul")
            .replace(new RegExp("Aug", 'g'), "Aug")
            .replace(new RegExp("Année", 'g'), "Year")
            .replace(new RegExp(escapeRegExp(" (decimal degrees)"), "g"), "")
    );

    var lines = contents.split('\n');
    var nbjours = [31.0, 28.0, 31.0, 30.0, 31.0, 30.0, 31.0, 31.0, 30.0, 31.0, 30.0, 31.0];
    var latitude, longitude;
    var boolAirTemp = true, bImportWind = true, bImportLinkTrouble = true;
    var colGlobal = 0, colRatio = 6, colTL = -1, colAirTemp = 8, colWindspeed = -1, colDI = -1, colDHI = -1, colSolarFrac = -1;

    meteoUpdate.directmensuel = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    meteoUpdate.diffusmensuel = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    meteoUpdate.solarfraction = [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05];
    meteoUpdate.vitessevent = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    meteoUpdate.temperature = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    meteoUpdate.linktrouble = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    meteoUpdate.source = src; //#5607
    meteoUpdate.typicalyear = null;
    var fromWindow = $("#mainWindows").val();
    if (typeof (typicalyear) != "undefined" && fromWindow != "database"/*#6389*/) { // #5761
        meteoUpdate.typicalyear = typicalyear;
        $("#importTMYDATA_div").show();
        //#6284
        var accessTMY = moduleVerify("TMY_8760", 0, false, false, false);
        if (accessTMY.valide) {
            $("#importTMYDATA_checkbox").prop("checked", true);
        } else {
            $("#importTMYDATA_checkbox").prop("checked", false);
        }
    } else {
        $("#importTMYDATA_div").hide();
    }

    for (var line = 0; line < lines.length; line++) {
        var str = lines[line];

        if (trace) console.log("line: ", line, "  -   ", str);

        var posLatitude = str.search("Latitude");
        if (posLatitude >= 0) {
            var res = str.replace("\uFFFD", "deg");//str.replace("°", "deg"); .replaceAll("\uFFFD", "\"");
            var tab = sscanf(res, "Latitude:	%ideg%i'%i\" %s"); // ATTENTION : bien laisser comme il est l'espace après Latitude !!
            if (tab.length == 4) {
                latitude = tab[0] + (tab[1] / 60.0) + (tab[2] / 3600.0); // float(deg)+(float(min)/60.0)+(float(sec)/3600.0);
                if (tab[3] == "South,") // ne pas oublier la virgule avec
                    latitude *= -1.0; // mettre en négatif
            }
            else if (tab.length == 2) {
                latitude = parseFloat(str.replace("Latitude:", "").trim());
            }
            else { // erreur de lecture
                latitude = 0.0;
            }
        }

        var posLatitudeDecDegrees = str.search("Latitude_dec");
        if (posLatitudeDecDegrees >= 0) {
            var tab = sscanf(res, "Latitude_dec:	%f");
            if (tab && tab.length === 1 && !isNaN(parseFloat(tab[0]))) {
                latitude = parseFloat(tab[0]);
            }
            else {
                latitude = 0.;
            }
        }

        var posLongitude = str.search("Longitude");
        if (posLongitude >= 0) {
            var res = str.replace("\uFFFD", "deg"); // \uFFFD pour caractère °
            var tab = sscanf(res, "Longitude:	%ideg%i'%i\" %s"); // ATTENTION : bien laisser comme il est l'espace après Longitude !!
            if (tab.length == 4) {
                longitude = tab[0] + (tab[1] / 60.0) + (tab[2] / 3600.0); // float(deg)+(float(min)/60.0)+(float(sec)/3600.0);
                if (tab[3] == "West")
                    longitude *= -1.0; // mettre en négatif
            }
            else if (tab.length == 2) {
                longitude = parseFloat(str.replace("Longitude:", "").trim());
            }
            else { // erreur de lecture
                longitude = 0.0;
            }
        }

        var posLongitudeDecDegrees = str.search("Longitude_dec");
        if (posLongitudeDecDegrees >= 0) {
            var tab = sscanf(res, "Longitude_dec:	%f");
            if (tab && tab.length === 1 && !isNaN(parseFloat(tab[0]))) {
                longitude = parseFloat(tab[0]);
            }
            else {
                longitude = 0.;
            }
        }

        var posMonth = str.search(/Month\t/i);//"5043"
        if (posMonth >= 0) {
            var tabTitle = str.split('\t');

            for (var i = 0; i < tabTitle.length; i++) {
                if (tabTitle[i] == "Hh") colGlobal = i;
                else if (tabTitle[i] == "TL") colTL = i;
                else if (tabTitle[i] == "D/G") colRatio = i;
                else if (tabTitle[i] == "T24h") colAirTemp = i;
                else if (tabTitle[i] == "Windspeed") colWindspeed = i;
                else if (tabTitle[i] == "DI") colDI = i;
                else if (tabTitle[i] == "DHI") colDHI = i;
                else if (tabTitle[i] == "SolarF") colSolarFrac = i;
            }

            for (var m = 0; m < 12; m++) { // on parse les lignes des mois ici :
                str = lines[line + m + 1];
                var month = "Jan";
                if (m == 1) month = "Feb";
                else if (m == 2) month = "Mar";
                else if (m == 3) month = "Apr";
                else if (m == 4) month = "May";
                else if (m == 5) month = "Jun";
                else if (m == 6) month = "Jul";
                else if (m == 7) month = "Aug";
                else if (m == 8) month = "Sep";
                else if (m == 9) month = "Oct";
                else if (m == 10) month = "Nov";
                else if (m == 11) month = "Dec";

                // ATTENTION : bien laisser les espaces comme ils sont !!!
                var tab = str.split('\t');
                if (trace) console.log("tab: ", tab);

                var valg = 0.001 * Math.round(tab[colGlobal]) * nbjours[m]; // global isolation -> Math.round au lieu de parseInt !!

                if (bImportWind && colWindspeed !== -1) {
                    if (tab[colWindspeed] !== "-1") {
                        meteoUpdate.vitessevent[m] = parseFloat(parseFloat(tab[colWindspeed]).toFixed(1));
                    }
                    else {
                        bImportWind = false;
                    }
                }

                var valdiffuse = valg * parseFloat(tab[colRatio]);
                if (colDHI !== -1) {
                    if (tab[colDHI] !== "-1") {
                        meteoUpdate.diffusmensuel[m] = Math.round(0.001 * nbjours[m] * parseFloat(tab[colDHI]));
                    }
                    else {
                        meteoUpdate.diffusmensuel[m] = Math.round(valdiffuse);
                    }
                }
                else {
                    meteoUpdate.diffusmensuel[m] = Math.round(valdiffuse);
                }

                if (colDI !== -1) {
                    if (tab[colDI] !== "-1") {
                        meteoUpdate.directmensuel[m] = Math.round(0.001 * nbjours[m] * parseFloat(tab[colDI]));
                    }
                    else {
                        meteoUpdate.directmensuel[m] = Math.round(valg - valdiffuse);
                    }
                }
                else {
                    meteoUpdate.directmensuel[m] = Math.round(valg - valdiffuse);
                }

                if (colSolarFrac !== -1) {
                    if (tab[colSolarFrac] !== "-1") {
                        meteoUpdate.solarfraction[m] = parseFloat(parseFloat(tab[colSolarFrac]).toFixed(2));
                    }
                    else {
                        meteoUpdate.solarfraction[m] = parseFloat(parseFloat(1.0 - parseFloat(tab[colRatio])).toFixed(2));
                    }
                }
                else {
                    meteoUpdate.solarfraction[m] = parseFloat(parseFloat(1.0 - parseFloat(tab[colRatio])).toFixed(2));
                }

                if (bImportLinkTrouble && colTL !== -1) {
                    if (tab[colTL] !== "-1") {
                        meteoUpdate.linktrouble[m] = parseFloat(parseFloat(tab[colTL]).toFixed(2));
                    }
                    else {// si pas de Trouble de Link : on met des valeurs par défaut issues du type de climat
                        bImportLinkTrouble = false;
                    }
                }

                if (tabTitle[colAirTemp] == null || tabTitle[colAirTemp] == "null") {
                    boolAirTemp = false;
                }
                else
                    meteoUpdate.temperature[m] = parseFloat(parseFloat(tab[colAirTemp]).toFixed(1));
            }
        }
    }

    $('#latitudeMeteo').val(number_format(latitude, 3));
    $('#longitudeMeteo').val(number_format(longitude, 3));
    $('#commentsMeteo').val(meteoUpdate.source);  //#5607

    if (!bImportWind || colWindspeed === -1) {
        meteoUpdate.vitessevent = [3.1, 3.3, 3.7, 4.1, 4.0, 3.9, 3.9, 3.6, 3.3, 3.1, 3.0, 3.0]; // climat aride
        if ($('#climateMeteo').val() == 1) { // Chinese
            meteoUpdate.vitessevent = [3.5, 3.6, 3.8, 3.8, 3.5, 3.4, 3.3, 3.3, 3.4, 3.3, 3.1, 3.3];
        }
        else if ($('#climateMeteo').val() == 2) { // Continental
            meteoUpdate.vitessevent = [3.5, 3.6, 3.6, 3.8, 3.6, 3.2, 3.0, 3.0, 3.1, 3.4, 3.5, 3.5];
        }
        else if ($('#climateMeteo').val() == 3) { // Mediterranean
            meteoUpdate.vitessevent = [3.8, 4.0, 3.8, 4.2, 3.9, 3.6, 3.6, 3.5, 3.4, 3.6, 3.9, 4.1];
        }
        else if ($('#climateMeteo').val() == 4) { //Mountainous
            meteoUpdate.vitessevent = [4.5, 4.6, 4.6, 4.5, 4.2, 4.0, 3.8, 3.7, 3.9, 4.2, 4.4, 4.5];
        }
        else if ($('#climateMeteo').val() == 5) { //Oceanic
            meteoUpdate.vitessevent = [3.9, 3.9, 3.8, 3.8, 3.4, 3.3, 3.3, 3.0, 3.2, 3.4, 3.6, 3.7];
        }
        else if ($('#climateMeteo').val() == 6) { //Polar
            meteoUpdate.vitessevent = [6.3, 6.3, 6.1, 6.0, 6.3, 5.8, 6.0, 6.3, 7.2, 7.6, 6.7, 6.7];
        }
        else if ($('#climateMeteo').val() == 7) { //Tropical
            meteoUpdate.vitessevent = [3.5, 3.6, 3.6, 3.5, 3.3, 3.1, 3.1, 3.0, 2.8, 2.7, 3.0, 3.1];
        }
    }

    if (!bImportLinkTrouble || colTL === -1) {
        // à voir si on récupère les données depuis SODA, ou plus proche station METEONorm, ou autre ... : laisser le choix à l'utilisateur
        // pour l'instant on fait comme les autres données, on met des données moyennes par climat :
        meteoUpdate.linktrouble = [3.3, 3.41, 3.58, 3.85, 3.88, 3.76, 3.84, 3.81, 3.65, 3.45, 3.23, 3.14]; // climat aride
        if ($('#climateMeteo').val() == 1) { // Chinese
            meteoUpdate.linktrouble = [3.54, 3.73, 4.20, 4.38, 4.22, 4.23, 3.99, 4.0, 3.9, 3.81, 3.5, 3.4];
        }
        else if ($('#climateMeteo').val() == 2) { // Continental
            meteoUpdate.linktrouble = [2.76, 3.0, 3.07, 3.19, 3.21, 3.21, 3.23, 3.15, 2.89, 2.7, 2.64, 2.57];
        }
        else if ($('#climateMeteo').val() == 3) { // Mediterranean
            meteoUpdate.linktrouble = [2.74, 2.9, 3.17, 3.26, 3.37, 3.44, 3.55, 3.49, 3.27, 3.09, 2.81, 2.72];
        }
        else if ($('#climateMeteo').val() == 4) { //Mountainous
            meteoUpdate.linktrouble = [2.58, 2.8, 2.99, 3.08, 2.99, 2.99, 3.06, 3.06, 2.84, 2.77, 2.6, 2.49];
        }
        else if ($('#climateMeteo').val() == 5) { //Oceanic
            meteoUpdate.linktrouble = [2.87, 3.07, 3.33, 3.43, 3.38, 3.42, 3.37, 3.35, 3.11, 3.03, 2.91, 2.82];
        }
        else if ($('#climateMeteo').val() == 6) { //Polar
            meteoUpdate.linktrouble = [1.91, 2.62, 2.7, 3.0, 2.97, 2.95, 2.92, 2.86, 2.69, 2.56, 2.22, 1.65];
        }
        else if ($('#climateMeteo').val() == 7) { //Tropical
            meteoUpdate.linktrouble = [3.88, 3.89, 4.08, 4.07, 4.12, 4.27, 4.24, 4.12, 3.97, 3.89, 3.75, 3.75];
        }
    }

    if (!boolAirTemp) {
        meteoUpdate.temperature = [10.0, 12.0, 15.9, 20.0, 24.6, 28.7, 31.1, 30.2, 26.6, 21.3, 15.1, 10.8];
        if ($('#climateMeteo').val() == 1) { // Chinese
            meteoUpdate.temperature = [9.3, 10.6, 13.6, 17.7, 21.3, 24.2, 26.3, 26.2, 23.7, 19.4, 15.1, 10.8];
        }
        else if ($('#climateMeteo').val() == 2) { // Continental
            meteoUpdate.temperature = [-7.8, -5.8, -1.0, 6.3, 12.5, 17.7, 20.6, 19.5, 14.7, 8.0, 1.1, -4.9];
        }
        else if ($('#climateMeteo').val() == 3) { // Mediterranean
            meteoUpdate.temperature = [8.8, 9.4, 11.9, 14.1, 18.2, 22.5, 24.7, 24.9, 21.5, 17.7, 12.8, 9.7];
        }
        else if ($('#climateMeteo').val() == 4) { //Mountainous
            meteoUpdate.temperature = [-0.9, 0.1, 2.6, 5.2, 8.6, 10.9, 12.0, 11.9, 9.5, 6.6, 2.5, -0.3];
        }
        else if ($('#climateMeteo').val() == 5) { //Oceanic
            meteoUpdate.temperature = [2.8, 3.7, 6.9, 9.8, 14.1, 17.3, 19.1, 19.1, 15.7, 11.7, 6.7, 3.7];
        }
        else if ($('#climateMeteo').val() == 6) { //Polar
            meteoUpdate.temperature = [-24.3, -24.5, -22.4, -15.8, -6.5, 1.2, 4.3, 2.3, -3.0, -10.3, -16.9, -19.8];
        }
        else if ($('#climateMeteo').val() == 7) { //Tropical
            meteoUpdate.temperature = [23.3, 23.8, 24.9, 25.8, 26.6, 26.8, 26.6, 26.6, 26.8, 26.6, 25.4, 23.8];
        }
    }

    if (latitude < 0.0) // si latitude est négative alors on est dans l'hémisphère sud, donc on décale de 6 mois les données moyennes par défaut
    {
        var vv = meteoUpdate.vitessevent;
        var t = meteoUpdate.temperature;
        var tl = meteoUpdate.linktrouble;
        for (var m1 = 0; m1 < 6; m1++) {
            if (!bImportWind)
                meteoUpdate.vitessevent[m1] = vv[m1 + 6];
            if (!bImportLinkTrouble)
                meteoUpdate.linktrouble[m1] = tl[m1 + 6];
            if (!boolAirTemp)
                meteoUpdate.temperature[m1] = t[m1 + 6];
        }
        for (var m2 = 6; m2 < 12; m2++) {
            if (!bImportWind)
                meteoUpdate.vitessevent[m2] = vv[m2 - 6];
            if (!bImportLinkTrouble)
                meteoUpdate.linktrouble[m2] = tl[m2 - 6];
            if (!boolAirTemp)
                meteoUpdate.temperature[m2] = t[m2 - 6];
        }
    }
    //console.log(meteoUpdate);
    updateMeteoGraphs(numGraph);

    if (!($('#nameMeteo').val())) {
        var sProvider = "PVGIS";

        if (eProvider) {
            switch (eProvider) {
                case EProvider.TMY_PVGis:
                    sProvider = "PVGIS";
                    break;
                case EProvider.TMY3:
                    sProvider = "TMY3";
                    break;
                case EProvider.TMY_PVSyst:
                    sProvider = "PVSYST";
                    break;
                case EProvider.TMY_Solargis:
                    sProvider = "SOLARGIS";
                    break;
                case EProvider.TMY:

                case EProvider.TMY2:
                    sProvider = "TMY";
                    break;
                default:
                    sProvider = "IMPORT";
                    break;
            }
        }
        $('#nameMeteo').val(sProvider + "_" + $('#latitudeMeteo').val() + "_" + $('#longitudeMeteo').val());
    }

    $("#testProgress").trigger("updateMeteoStationFormData")
}

$("#fileImportPVGis").change(function (e, fileTestAuto) {
    var trace = 0;
    //Retrieve all the files from the FileList object
    var files = e.target.files;
    var e_prime = e;
    if (trace) console.log(files);
    if (files) {
        for (var i = 0, f; f = files[i]; i++) {
            var r = new FileReader();
            r.onload = (function (f) {
                return function (e) {
                    var contents = e.target.result;
                    e_prime.target.value = null;
                    return updateMeteoStationFormData(contents, EProvider.TMY_PVGis, f.name);
                };
            })(f);

            r.readAsText(f, 'UTF-8');
        }
    } else {
        alert("Failed to load files");
    }
});

String.prototype.sansAccent = function () {
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

    var str = this;
    for (var i = 0; i < accent.length; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
}

function parseTMYFileMonth(sContent, oParams, eProvider) {
    var mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var OrderTLColumn = null;
    var OrderDHIColumn = null;
    var OrderDIColumn = null;
    var OrderSolarFColumn = null;
    var OrderWindSpeedColumn = null;
    var OrderT24HColumn = null;
    var OrderDirectNormal = null;
    var Order = 0;
    var Passed1 = false;
    var Passed2 = false;
    var Passed3 = false;
    var Passed4 = false;
    var Passed5 = false;
    var Passed6 = false;
    var Passed7 = false;
    var valLat = null;
    var valLong = null;
    var valAltitude = null;
    var fileSplitLigne = sContent.split('\n');
    for (var i = 0; i < fileSplitLigne.length - 1; i++) {

        if (fileSplitLigne[i].toLowerCase().indexOf(oParams.startDataColumns.toLowerCase()) != -1) {
            var fileSplitHeader = fileSplitLigne[i].split(oParams.separatorData);
        }
    }
    for (var i = 0; i < fileSplitHeader.length; i++) {//boucle pour récupérer l'ordre des colonnes
        Order += 1
        if (oParams.timeData.TL.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.TL.nameinCSV.toLowerCase()) != -1 && !Passed1) {
                OrderTLColumn = Order;
                Passed1 = true;
            }
        }
        if (oParams.timeData.DHI.nameinCSV != null) {

            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.DHI.nameinCSV.toLowerCase()) != -1 && !Passed2) {
                OrderDHIColumn = Order;
                Passed2 = true;
            }
        }
        if (oParams.timeData.DI.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.DI.nameinCSV.toLowerCase()) != -1 && !Passed3) {
                OrderDIColumn = Order;
                Passed3 = true;
            }
        }
        if (oParams.timeData.SolarF.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.SolarF.nameinCSV.toLowerCase()) != -1 && !Passed4) {
                OrderSolarFColumn = Order;
                Passed4 = true;
            }
        }
        if (oParams.timeData.Windspeed.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.Windspeed.nameinCSV.toLowerCase()) != -1 && !Passed5) {
                OrderWindSpeedColumn = Order;
                Passed5 = true;
            }
        }
        if (oParams.timeData.T24h.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.T24h.nameinCSV.toLowerCase()) != -1 && !Passed6) {
                OrderT24HColumn = Order;
                Passed6 = true;
            }
        }
        if (oParams.timeData.direct_normal.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.direct_normal.nameinCSV.toLowerCase()) != -1 && !Passed7) {
                OrderDirectNormal = Order;
                Passed7 = true;
            }
        }
    }
    for (var i = 0; i < fileSplitLigne.length; i++) {//boucle pour récupérer les data globales

        if (fileSplitLigne[i].toLowerCase().indexOf(oParams.startDataLine.toLowerCase()) != -1) {
            var indexValue = i + 1;
        }
        if (eProvider == "TMY3") { // pour format NREL on peut pas recupérer la lat en fonction du nom            
            var fileSplitTMY3 = fileSplitLigne[0].split(oParams.separatorData);
            valLat = parseFloat(fileSplitTMY3[4].replace(',', '.'));
            valLong = parseFloat(fileSplitTMY3[5].replace(',', '.'));
            valAltitude = parseFloat(fileSplitTMY3[6].replace(',', '.'));
        }
        else {
            if (fileSplitLigne.length > 21) {

                if (fileSplitLigne[i].indexOf(oParams.globalData.lat.nameinCSV) != -1) {//recup lat dans csv
                    var fileSplit2 = fileSplitLigne[i].split(oParams.globalData.lat.nameinCSV);
                    valLat = parseFloat(fileSplit2[1].replace(',', '.'));
                }
                if (fileSplitLigne[i].indexOf(oParams.globalData.long.nameinCSV) != -1) {//recup long dans csv
                    var fileSplit2 = fileSplitLigne[i].split(oParams.globalData.long.nameinCSV);
                    valLong = parseFloat(fileSplit2[1].replace(',', '.'));
                }
                if (fileSplitLigne[i].indexOf(oParams.globalData.altitude.nameinCSV) != -1) {//recup alti dans csv
                    var fileSplit2 = fileSplitLigne[i].split(oParams.globalData.altitude.nameinCSV);
                    valAltitude = parseFloat(fileSplit2[1].replace(',', '.'));
                }
            }
        }
    }

    var SumWind = null;
    var SumDHI = null;
    var SumDI = null;
    var SumDirectNormal = null
    var SumDirectNormalSup120 = null;
    var SumTemp = null;
    var SumGlobInc = null;
    var incrementeTemp = null;
    var fileSplitLigne = sContent.split('\n');
    var SumWindMonth = new Array(12);
    var SumDHIMonth = new Array(12);
    var SumDIMonth = new Array(12);
    var SumGHIMonth = new Array(12);
    var SumSolarFMonth = new Array(12);
    var SumDirectNormalSup120Month = new Array(12);
    var SumTempMonth = new Array(12);
    var SumDirectNormalMonth = new Array(12);
    var SumMonth = new Array(12);
    var valueMonth = 1;
    var incrementeX = 0;
    var SumGlobIncTot = null;
    var SumDHITot = null;
    var SumWindTot = null;
    var SumDITot = null;
    var SumTempTot = null;
    var SumDirectNormalSup120Tot = null;
    var incrementeDITot = 12;
    var incrementeDirectNormalSup120Tot = 12;
    var incrementeTempTot = 12;
    var incrementeDHITot = 12;
    var incrementeXTot = 12;
    var incrementeDirectNormalTot = 12;
    var xDate = 1;

    for (var i = indexValue; i < fileSplitLigne.length; i++) {
        if (oParams.timeData.TIME.nameinCSV == null) {
            var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 1);
            if (oParams.timeData.TIME.Colonne1 != null) {
                if (oParams.timeData.TIME.Colonne2 != null) {
                    if (oParams.timeData.TIME.Colonne3 != null) {
                        if (oParams.timeData.TIME.Colonne4 != null) {
                            if (oParams.timeData.TIME.Colonne5 != null) {
                                if (oParams.timeData.TIME.Colonne6 != null) {
                                    var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 6);
                                    fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                                }
                                else {
                                    var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 5);
                                    fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                                }
                            }
                            else {
                                var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 4);
                                fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                            }
                        }
                        else {
                            var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 3);
                            fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                        }
                    }
                    else {
                        var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 2);
                        fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                    }
                }
            }
        }

        var fileSplitValuesColumns = fileSplitLigne[i].split(oParams.separatorData);
        //var valueDecomposeDate = fileSplitValuesColumns[0].split(" ");
        if (fileSplitValuesColumnsFormat == "Fév" || fileSplitValuesColumnsFormat == "Avr" || fileSplitValuesColumnsFormat == "Mai" || fileSplitValuesColumnsFormat == "Aoû" || fileSplitValuesColumnsFormat == "Déc") {
            fileSplitValuesColumnsFormat = months[valueMonth - 1];

        }

        var maDate = moment(fileSplitValuesColumnsFormat, oParams.timeData.TIME.format).toDate();

        //var maDate = new Date(valueDecomposeDate[0].split('-').join(' '))//.toLocaleDateString("fr", { year:"numeric", month:"numeric", day:"numeric"});
        if (moment(maDate).month() + 1 == valueMonth && i != fileSplitLigne.length - 1) {

            if (OrderWindSpeedColumn != null) {
                SumWind = SumWind + parseFloat(fileSplitValuesColumns[OrderWindSpeedColumn - xDate].replace(',', '.'));
            }
            else {
                SumWind = null;
            }
            if (OrderT24HColumn != null) {
                SumTemp = SumTemp + parseFloat(fileSplitValuesColumns[OrderT24HColumn - xDate].replace(',', '.'));
            }
            else {
                SumTemp = null;
            }
            if (OrderDHIColumn != null) {
                if (parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')) > 0) {
                    SumDHI = SumDHI + parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'));
                }
            }
            else {
                SumDHI = null;
            }
            if (OrderDirectNormal != null) {
                if (parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.')) > 0) {
                    SumDirectNormal = SumDirectNormal + parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.'));
                }
                if (parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.')) > 120) {
                    SumDirectNormalSup120 = SumDirectNormalSup120 + parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.'));
                }
            }
            else if (OrderDIColumn != null && OrderDHIColumn != null) { // cas ou pas de direct normal 
                if ((parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate]).replace(',', '.')) > 0) {
                    SumDirectNormal = SumDirectNormal + parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate]) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'));
                }
                if ((parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'))) > 120) {
                    SumDirectNormalSup120 = SumDirectNormalSup120 + (parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')));
                }
            }
            else {
                SumDirectNormal = null;
            }
            if (OrderDIColumn != null) {
                if (parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) > 0) {
                    SumDI = SumDI + parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.'));
                }
            }
            else {
                SumDI = null;
            }
            if (OrderWindSpeedColumn != null) {
                SumWindMonth[valueMonth - 1] = SumWind.toFixed(2);


            }
            else {
                SumWindMonth[valueMonth - 1] = null;
            }
            if (OrderT24HColumn != null) {
                SumTempMonth[valueMonth - 1] = SumTemp.toFixed(2);
            }
            else {
                SumTempMonth[valueMonth - 1] = null;
            }
            if (OrderDHIColumn != null) {
                SumDHIMonth[valueMonth - 1] = SumDHI.toFixed(0);
            }
            else {
                SumDHIMonth[valueMonth - 1] = null;
            }
            if (OrderDirectNormal != null || (OrderDIColumn != null && OrderDHIColumn != null)) {
                SumDirectNormalMonth[valueMonth - 1] = SumDirectNormal;
                SumDirectNormalSup120Month[valueMonth - 1] = SumDirectNormalSup120;
            }
            else {
                SumDirectNormalMonth[valueMonth - 1] = null;
                SumDirectNormalSup120Month[valueMonth - 1] = null;
            }
            if (OrderDIColumn != null) {
                SumGHIMonth[valueMonth - 1] = (SumDI);
                SumDIMonth[valueMonth - 1] = (SumDI - SumDHI).toFixed(0);
            }
            else {
                SumDIMonth[valueMonth - 1] = null;
            }
            if ((OrderDIColumn != null && OrderDirectNormal != null) || (OrderDIColumn != null && OrderDHIColumn != null)) {
                SumSolarFMonth[valueMonth - 1] = null;
            }
            else {
                SumSolarFMonth[valueMonth - 1] = null;
            }

            SumGlobIncTot = SumGlobIncTot + SumGlobInc;
            SumDHITot = SumDHITot + SumDHI;
            SumWindTot = SumWindTot + SumWind;
            SumDITot = SumDITot + SumDI;
            SumTempTot = SumTempTot + SumTemp;
            SumDirectNormalSup120Tot = SumDirectNormalSup120Tot + SumDirectNormalSup120;
            SumDirectNormal = null;
            SumDHI = null;
            SumWind = null;
            SumDI = null;
            SumTemp = null;
            SumDirectNormalSup120 = null;
            if (valueMonth == 12) {
                break;
            }
            else {

                valueMonth = moment(maDate).month() + 2;
            }
        }
    }
    SumMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Year"]
    var TabHeadearTMY = {
        "Latitude": valLat,
        "Longitude": valLong,
        "Altitude": valAltitude
    };
    var TabValeur = new Array(12);
    var TabChamp = {
        "Mois": ["Month"], "TL": [oParams.timeData.TL.nameinCSV], "Temperature": [oParams.timeData.T24h.nameinCSV], "WindSpeed": [oParams.timeData.Windspeed.nameinCSV], "Direct_Normal": [oParams.timeData.DI.nameinCSV], "Diffuse_Horizontal": [oParams.timeData.DHI.nameinCSV], "SolarF": [oParams.timeData.SolarF.nameinCSV]
    }
    for (var i = 0; i < 12; i++) {
        TabValeur[i] = { "Mois": SumMonth[i], "TL": null, "Temperature": SumTempMonth[i], "WindSpeed": SumWindMonth[i], "Direct_Normal": SumDIMonth[i], "Diffuse_Horizontal": SumDHIMonth[i], "SolarF": SumSolarFMonth[i], "Globale_Horizontale": SumGHIMonth[i] };
    }
    var TabValYear = { "Année": SumMonth[12], "TLTot": null, "TemperatureTot": SumTempTot / incrementeTempTot, "WindSpeedTot": SumWindTot / incrementeXTot, "Direct_NormalTot": SumDITot / incrementeDITot, "Diffuse_HorizontalTot": SumDHITot / incrementeDHITot, "SolarFTot": incrementeDirectNormalSup120Tot / incrementeDITot };
    var TabTot = {
        "ValeursGlobales": TabHeadearTMY,
        "champsValeurs": TabChamp,
        "ValeursMensuelles": TabValeur,
        "ValeursAnnuelles": TabValYear
    };

    return TabTot;
}
function parseTMYFile(sContent, oParams, eProvider) {//#6467
    console.log("sContent:",sContent);
    console.log("oParams:",oParams)

    var OrderTLColumn = null;
    var OrderDHIColumn = null;
    var OrderDIColumn = null;
    var OrderSolarFColumn = null;
    var OrderWindSpeedColumn = null;
    var OrderT24HColumn = null;
    var OrderDirectNormal = null;
    var Order = 0;
    var Passed1 = false;
    var Passed2 = false;
    var Passed3 = false;
    var Passed4 = false;
    var Passed5 = false;
    var Passed6 = false;
    var Passed7 = false;
    var fileSplitLigne = sContent.split('\n');
    for (var i = 0; i < fileSplitLigne.length - 1; i++) {
        if (fileSplitLigne[i].toLowerCase().indexOf(oParams.startDataColumns.toLowerCase()) != -1) {
            var fileSplitHeader = fileSplitLigne[i].split(oParams.separatorData);
        }
    }
    for (var i = 0; i < fileSplitHeader.length; i++) {//boucle pour récupérer l'ordre des colonnes
        Order += 1
        if (oParams.timeData.TL.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.TL.nameinCSV.toLowerCase()) != -1 && !Passed1) {
                OrderTLColumn = Order;
                Passed1 = true;
            }
        }
        if (oParams.timeData.DHI.nameinCSV != null) {

            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.DHI.nameinCSV.toLowerCase()) != -1 && !Passed2) {
                OrderDHIColumn = Order;
                Passed2 = true;
            }
        }
        if (oParams.timeData.DI.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.DI.nameinCSV.toLowerCase()) != -1 && !Passed3) {
                OrderDIColumn = Order;
                Passed3 = true;
            }
        }
        if (oParams.timeData.SolarF.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.SolarF.nameinCSV.toLowerCase()) != -1 && !Passed4) {
                OrderSolarFColumn = Order;
                Passed4 = true;
            }
        }
        if (oParams.timeData.Windspeed.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.Windspeed.nameinCSV.toLowerCase()) != -1 && !Passed5) {
                OrderWindSpeedColumn = Order;
                Passed5 = true;
            }
        }
        if (oParams.timeData.T24h.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.T24h.nameinCSV.toLowerCase()) != -1 && !Passed6) {
                OrderT24HColumn = Order;
                Passed6 = true;
            }
        }
        if (oParams.timeData.direct_normal.nameinCSV != null) {
            if (fileSplitHeader[i].toLowerCase().indexOf(oParams.timeData.direct_normal.nameinCSV.toLowerCase()) != -1 && !Passed7) {
                OrderDirectNormal = Order;
                Passed7 = true;
            }
        }
    }
    for (var i = 0; i < fileSplitLigne.length; i++) {//boucle pour récupérer les data globales
        if (fileSplitLigne[i].toLowerCase().indexOf(oParams.startDataLine.toLowerCase()) != -1) {
            var indexValue = i + 1;
        }
        if (eProvider == "TMY3") { // pour format NREL on peut pas recupérer la lat en fonction du nom
            var fileSplitTMY3 = fileSplitLigne[0].split(oParams.separatorData);
            var valLat = parseFloat(fileSplitTMY3[4].replace(',', '.'));
            var valLong = parseFloat(fileSplitTMY3[5].replace(',', '.'));
            var valAltitude = parseFloat(fileSplitTMY3[6].replace(',', '.'));
        }
        else {

            if (fileSplitLigne[i].indexOf(oParams.globalData.lat.nameinCSV) != -1) {//recup lat dans csv
                var fileSplit2 = fileSplitLigne[i].split(oParams.globalData.lat.nameinCSV);
                var valLat = parseFloat(fileSplit2[1].replace(',', '.'));
            }
            if (fileSplitLigne[i].indexOf(oParams.globalData.long.nameinCSV) != -1) {//recup long dans csv
                var fileSplit2 = fileSplitLigne[i].split(oParams.globalData.long.nameinCSV);
                var valLong = parseFloat(fileSplit2[1].replace(',', '.'));
            }
            if (fileSplitLigne[i].indexOf(oParams.globalData.altitude.nameinCSV) != -1) {//recup alti dans csv
                var fileSplit2 = fileSplitLigne[i].split(oParams.globalData.altitude.nameinCSV);
                if (fileSplit2[1].indexOf(" ") != -1) {
                    fileSplit2 = fileSplit2[1].split(" ");
                }
                if (eProvider == "TMY_Solargis") {
                    parseFloat(fileSplit2[1].replace(',', '.'));
                }
                else if (eProvider == "TMY_3E") {
                    var valAltitude = parseFloat(fileSplit2[fileSplit2.length - 1].replace(',', '.'));
                }

            }
        }
    }
    var SumWind = null;
    var SumDHI = null;
    var SumDI = null;
    var SumDirectNormal = null
    var SumDirectNormalSup120 = null;
    var SumTemp = null;
    var SumGlobInc = null;
    var incrementeDHI = null;
    var incrementeDirectNormal = null;
    var incrementeDI = null;
    var incrementeDirectNormalSup120 = null;
    var incrementeTemp = null;
    var fileSplitLigne = sContent.split('\n');
    var SumWindMonth = new Array(12);
    var SumDHIMonth = new Array(12);
    var SumDIMonth = new Array(12);
    var SumSolarFMonth = new Array(12);
    var SumDirectNormalSup120Month = new Array(12);
    var SumTempMonth = new Array(12);
    var SumDirectNormalMonth = new Array(12);
    var SumMonth = new Array(12);
    var valueMonth = 1;
    var incrementeX = 0;
    var SumGlobIncTot = null;
    var SumDHITot = null;
    var SumWindTot = null;
    var SumDITot = null;
    var SumTempTot = null;
    var SumDirectNormalSup120Tot = null;
    var incrementeDITot = null;
    var incrementeDirectNormalSup120Tot = null;
    var incrementeTempTot = null;
    var incrementeDHITot = null;
    var incrementeXTot = null;
    var incrementeDirectNormalTot = null;
    var xDate = 1;
    var incrementeA = 0
    var tabwind = new Array(8760);
    var tabDI = new Array(8760);
    var tabTemp = new Array(8760);
    var tabDHI = new Array(8760);
    for (var i = indexValue; i < fileSplitLigne.length; i++) {
        if (oParams.timeData.TIME.nameinCSV == null) {
            var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 1);
            if (oParams.timeData.TIME.Colonne1 != null) {
                if (oParams.timeData.TIME.Colonne2 != null) {
                    if (oParams.timeData.TIME.Colonne3 != null) {
                        if (oParams.timeData.TIME.Colonne4 != null) {
                            if (oParams.timeData.TIME.Colonne5 != null) {
                                if (oParams.timeData.TIME.Colonne6 != null) {
                                    var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 6);
                                    fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                                }
                                else {
                                    var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 5);
                                    fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                                }
                            }
                            else {
                                var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 4);
                                fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                            }
                        }
                        else {
                            var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 3);
                            fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                        }
                    }
                    else {
                        var fileSplitValuesColumnsFormat = fileSplitLigne[i].split(oParams.separatorData, 2);
                        fileSplitValuesColumnsFormat = fileSplitValuesColumnsFormat.join(' ');
                    }
                }
            }
        }
        var fileSplitValuesColumns = fileSplitLigne[i].split(oParams.separatorData);
        //var valueDecomposeDate = fileSplitValuesColumns[0].split(" ");

        var maDate = moment(fileSplitValuesColumnsFormat, oParams.timeData.TIME.format).toDate();
        //var maDate = new Date(valueDecomposeDate[0].split('-').join(' '))//.toLocaleDateString("fr", { year:"numeric", month:"numeric", day:"numeric"});
        if (moment(maDate).month() + 1 == valueMonth && i != fileSplitLigne.length - 2) {

            if (OrderWindSpeedColumn != null) {
                tabwind[incrementeA] = (fileSplitValuesColumns[OrderWindSpeedColumn - xDate].replace(',', '.'));
                SumWind = SumWind + parseFloat(fileSplitValuesColumns[OrderWindSpeedColumn - xDate].replace(',', '.'));
            }
            else {
                SumWind = null;
            }


            if (OrderT24HColumn != null) {
                tabTemp[incrementeA] = parseFloat(fileSplitValuesColumns[OrderT24HColumn - xDate].replace(',', '.'));
                SumTemp = SumTemp + parseFloat(fileSplitValuesColumns[OrderT24HColumn - xDate].replace(',', '.'));
            }
            else {
                SumTemp = null;
            }
            incrementeTemp += 1;
            if (OrderDHIColumn != null) {
                if (parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')) >= 0) {
                    tabDHI[incrementeA] = (parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')));
                    incrementeDHI += 1;
                    SumDHI = SumDHI + parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'));
                }
            }
            else {
                SumDHI = null;

            }
            if (OrderDirectNormal != null) {
                if (parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.')) >= 0) {
                    incrementeDirectNormal += 1;
                    SumDirectNormal = SumDirectNormal + parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.'));
                }
                if (parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.')) > 120) {
                    incrementeDirectNormalSup120 += 1;
                    SumDirectNormalSup120 = SumDirectNormalSup120 + parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.'));
                }
            }
            else if (OrderDIColumn != null && OrderDHIColumn != null) { // cas ou pas de direct normal 
                if ((parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'))) > 0) {
                    incrementeDirectNormal += 1;
                    SumDirectNormal = SumDirectNormal + parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'));
                }
                if ((parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'))) > 120) {
                    incrementeDirectNormalSup120 += 1;
                    SumDirectNormalSup120 = SumDirectNormalSup120 + (parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')));
                }
            }
            else {
                SumDirectNormal = null;
            }
            if (OrderDIColumn != null) {
                if (parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) >= 0) {
                    incrementeDI += 1;
                    tabDI[incrementeA] = (parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')))
                    SumDI = SumDI + parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.'));
                }
            }
            else {
                SumDI = null;
            }
            incrementeX += 1;
            incrementeA += 1;
        }
        else {
            if (incrementeA != 8760) { //#7542
                if (OrderWindSpeedColumn != null) {
                    tabwind[incrementeA] = fileSplitValuesColumns[OrderWindSpeedColumn - xDate].replace(',', '.');
                    SumWind = SumWind + parseFloat(fileSplitValuesColumns[OrderWindSpeedColumn - xDate].replace(',', '.'));
                }
                else {
                    SumWind = null;
                }


                if (OrderT24HColumn != null) {
                    tabTemp[incrementeA] = (parseFloat(fileSplitValuesColumns[OrderT24HColumn - xDate].replace(',', '.')));
                    SumTemp = SumTemp + parseFloat(fileSplitValuesColumns[OrderT24HColumn - xDate].replace(',', '.'));
                }
                else {
                    SumTemp = null;
                }
                incrementeTemp += 1;
                if (OrderDHIColumn != null) {
                    if (parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')) >= 0) {
                        tabDHI[incrementeA] = (parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')));
                        incrementeDHI += 1;
                        SumDHI = SumDHI + parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'));
                    }
                }
                else {
                    SumDHI = null;

                }
                if (OrderDirectNormal != null) {
                    if (parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.')) >= 0) {
                        incrementeDirectNormal += 1;
                        SumDirectNormal = SumDirectNormal + parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.'));
                    }
                    if (parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.')) > 120) {
                        incrementeDirectNormalSup120 += 1;
                        SumDirectNormalSup120 = SumDirectNormalSup120 + parseFloat(fileSplitValuesColumns[OrderDirectNormal - xDate].replace(',', '.'));
                    }
                }
                else if (OrderDIColumn != null && OrderDHIColumn != null) { // cas ou pas de direct normal 
                    if ((parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'))) > 0) {
                        incrementeDirectNormal += 1;
                        SumDirectNormal = SumDirectNormal + parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'));
                    }
                    if ((parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.'))) > 120) {
                        incrementeDirectNormalSup120 += 1;
                        SumDirectNormalSup120 = SumDirectNormalSup120 + (parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) - parseFloat(fileSplitValuesColumns[OrderDHIColumn - xDate].replace(',', '.')));
                    }
                }
                else {
                    SumDirectNormal = null;
                }
                if (OrderDIColumn != null) {
                    if (parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.')) >= 0) {
                        incrementeDI += 1;
                        tabDI[incrementeA] = parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.'));
                        SumDI = SumDI + parseFloat(fileSplitValuesColumns[OrderDIColumn - xDate].replace(',', '.'));
                    }
                }
                else {
                    SumDI = null;
                }
            }
            incrementeX += 1;
            if (OrderWindSpeedColumn != null) {
                SumWindMonth[valueMonth - 1] = (SumWind / incrementeX).toFixed(2);

            }
            else {
                SumWindMonth[valueMonth - 1] = null;
            }

            if (OrderT24HColumn != null) {
                SumTempMonth[valueMonth - 1] = ((SumTemp) / incrementeTemp).toFixed(2);

            }
            else {
                SumTempMonth[valueMonth - 1] = null;
            }

            if (OrderDHIColumn != null) {

                SumDHIMonth[valueMonth - 1] = ((SumDHI) / 1000).toFixed(0);
            }
            else {
                SumDHIMonth[valueMonth - 1] = null;
            }
            if (OrderDIColumn != null) {
                SumDIMonth[valueMonth - 1] = ((SumDI - SumDHI) / 1000).toFixed(0);
            }
            else {
                SumDIMonth[valueMonth - 1] = null;
            }
            if (OrderDirectNormal != null || (OrderDIColumn != null && OrderDHIColumn != null)) {
                SumDirectNormalMonth[valueMonth - 1] = SumDirectNormal / incrementeDirectNormal;
                SumDirectNormalSup120Month[valueMonth - 1] = SumDirectNormalSup120 / incrementeDirectNormalSup120;
            }
            else {
                SumDirectNormalMonth[valueMonth - 1] = null;
                SumDirectNormalSup120Month[valueMonth - 1] = null;
            }

            if ((OrderDIColumn != null && OrderDirectNormal != null) || (OrderDIColumn != null && OrderDHIColumn != null)) {
                SumSolarFMonth[valueMonth - 1] = incrementeDirectNormalSup120 / incrementeDI;

            }
            else {
                SumSolarFMonth[valueMonth - 1] = null;
            }
            incrementeA += 1;
            SumGlobIncTot = SumGlobIncTot + SumGlobInc;
            SumDHITot = SumDHITot + SumDHI;
            SumWindTot = SumWindTot + SumWind;
            SumDITot = SumDITot + SumDI;
            SumTempTot = SumTempTot + SumTemp;
            SumDirectNormalSup120Tot = SumDirectNormalSup120Tot + SumDirectNormalSup120
            incrementeDirectNormalTot = incrementeDirectNormalTot + incrementeDirectNormal;
            incrementeDHITot = incrementeDHITot + incrementeDHI;
            incrementeXTot = incrementeXTot + incrementeX;
            incrementeDITot = incrementeDITot + incrementeDI;
            incrementeTempTot = incrementeTempTot + incrementeTemp;
            incrementeDirectNormalSup120Tot = incrementeDirectNormalSup120Tot + incrementeDirectNormalSup120
            SumDirectNormal = null;
            SumDHI = null;
            SumWind = null;
            SumDI = null;
            SumTemp = null;
            SumDirectNormalSup120 = null;
            incrementeDirectNormalSup120 = null;
            incrementeX = null;
            incrementeDHI = null;
            incrementeDI = null;
            incrementeTemp = null;
            incrementeDirectNormal = null;
            if (valueMonth == 12) {
                break;
            }
            else {
                valueMonth = moment(maDate).month() + 1;
            }
        }

    }
    SumMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Year"]
    var TabHeadearTMY = {
        "Latitude": valLat,
        "Longitude": valLong,
        "Altitude": valAltitude
    };

    var typicalYear = {
        "GhA": tabDI,
        "WindA": tabwind,
        "TambA": tabTemp
    }
    var TabValeur = new Array(12);
    var TabChamp = {
        "Mois": ["Month"], "TL": [oParams.timeData.TL.nameinCSV], "Temperature": [oParams.timeData.T24h.nameinCSV], "WindSpeed": [oParams.timeData.Windspeed.nameinCSV], "Direct_Normal": [oParams.timeData.DI.nameinCSV], "Diffuse_Horizontal": [oParams.timeData.DHI.nameinCSV], "SolarF": [oParams.timeData.SolarF.nameinCSV]
    }
    for (var i = 0; i < 12; i++) {

        TabValeur[i] = { "Mois": SumMonth[i], "TL": null, "Temperature": SumTempMonth[i], "WindSpeed": SumWindMonth[i], "Direct_Normal": SumDIMonth[i], "Diffuse_Horizontal": SumDHIMonth[i], "SolarF": SumSolarFMonth[i] };

    }

    var TabValYear = { "Année": SumMonth[12], "TLTot": null, "TemperatureTot": SumTempTot / incrementeTempTot, "WindSpeedTot": SumWindTot / incrementeXTot, "Direct_NormalTot": SumDITot / incrementeDITot, "Global_HorizontalTot": SumDITot / incrementeDITot, "Diffuse_HorizontalTot": SumDHITot / incrementeDHITot, "SolarFTot": incrementeDirectNormalSup120Tot / incrementeDITot };
    var TabTot = {
        "ValeursGlobales": TabHeadearTMY,
        "champsValeurs": TabChamp,
        "typicalYear": typicalYear,
        "ValeursMensuelles": TabValeur,
        "ValeursAnnuelles": TabValYear
    };
    return TabTot;
}

function defineParam(eProvider, Scontents) {

    console.log("eProvider:",eProvider)


    if (eProvider == "TMY_3E") {
        var oParams = {
            "globalData": {
                "lat": {
                    "nameinCSV": "Latitude:"
                },
                "long": {
                    "nameinCSV": "Longitude:"
                },
                "altitude": {
                    "nameinCSV": "Altitude:"
                },
            },
            "startDataLine": "datetime",
            "startDataColumns": ",global_horizontal",
            "separatorData": ",",
            "timeData": {
                "TL": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "TIME": {
                    "nameinCSV": null,
                    "format": "YYYY-MM-DD HH:mm:SS", // tout le format date est sur la même collonne
                    "Colonne1": null,
                    "Colonne2": null,
                    "Colonne3": null,
                    "Colonne4": null,
                    "Colonne5": null,
                    "Colonne6": null
                },
                "DHI": {
                    "nameinCSV": "diffuse_horizontal",
                    "unitCoef": 1
                },
                "DI": {
                    "nameinCSV": "global_horizontal",
                    "unitCoef": 1
                },
                "SolarF": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "Windspeed": {
                    "nameinCSV": "wind_speed",
                    "unitCoef": 1
                },
                "T24h": {
                    "nameinCSV": "ambient_temperature",
                    "unitCoef": 1
                },
                "direct_normal": {
                    "nameinCSV": "direct_normal",
                    "unitCoef": 1
                },
            }
        }
    }
    else if (eProvider == "TMY_PVGis") {
        var oParams = {
            "globalData": {
                "lat": {
                    "nameinCSV": "Latitude (decimal degrees):"
                },
                "long": {
                    "nameinCSV": "Longitude (decimal degrees):"
                },
                "altitude": {
                    "nameinCSV": "Elevation (m):"
                },
            },
            "startDataLine": "time",
            "startDataColumns": "time",
            "separatorData": ",",
            "timeData": {
                "TL": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "TIME": {
                    "nameinCSV": null,
                    "format": "YYYYMMDD:HHmm",
                    "Colonne1": null,
                    "Colonne2": null,
                    "Colonne3": null,
                    "Colonne4": null,
                    "Colonne5": null,
                    "Colonne6": null

                },
                "DHI": {
                    "nameinCSV": "Gd(h)",
                    "unitCoef": 1
                },
                "DI": {
                    "nameinCSV": "G(h)",
                    "unitCoef": 1
                },
                "SolarF": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "Windspeed": {
                    "nameinCSV": "WS10m",
                    "unitCoef": 1
                },
                "T24h": {
                    "nameinCSV": "T2m",
                    "unitCoef": 1
                },
                "direct_normal": {
                    "nameinCSV": "direct_normal",
                    "unitCoef": 1
                },
            }
        }
    }
    else if (eProvider == "TMY_PVSyst") {
        var oParams = {
            "globalData": {
                "lat": {
                    "nameinCSV": "Latitude;"
                },
                "long": {
                    "nameinCSV": "Longitude;"
                },
                "altitude": {
                    "nameinCSV": "Altitude;"
                },
            },
            "startDataLine": ";;",
            "startDataColumns": "Year",
            "separatorData": ";",
            "timeData": {
                "TL": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "TIME": {
                    "nameinCSV": null,
                    "format": "YYYY M D H m",
                    "Colonne1": "Year",
                    "Colonne2": "Month",
                    "Colonne3": "Day",
                    "Colonne4": "Hour",
                    "Colonne5": "Minute",
                    "Colonne6": null
                },
                "DHI": {
                    "nameinCSV": "DHI",
                    "unitCoef": 1
                },
                "DI": {
                    "nameinCSV": "GHI",
                    "unitCoef": 1
                },
                "SolarF": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "Windspeed": {
                    "nameinCSV": "WindVel",
                    "unitCoef": 1
                },
                "T24h": {
                    "nameinCSV": "Tamb",
                    "unitCoef": 1
                },
                "direct_normal": {
                    "nameinCSV": "direct_normal",
                    "unitCoef": 1
                },
            }
        }
    }
    else if (eProvider == "Month_Solargis") {
        var ScontentSplit = Scontents.split('\n');
        if (ScontentSplit.length <= 21) {//5173 cas de fichier xslx transformé en csv 
            var oParams = {
                "globalData": {
                    "lat": {
                        "nameinCSV": ""
                    },
                    "long": {
                        "nameinCSV": ""
                    },
                    "altitude": {
                        "nameinCSV": ""
                    },
                },
                "startDataLine": "kWh/m",
                "startDataColumns": ";GHI",
                "separatorData": ";",

                "timeData": {
                    "TL": {
                        "nameinCSV": null,
                        "unitCoef": 1
                    },
                    "TIME": {// même si on 
                        "nameinCSV": null,
                        "format": "MMM",
                        "Colonne1": "Mois",
                        "Colonne2": null,
                        "Colonne3": null,
                        "Colonne4": null,
                        "Colonne5": null,
                        "Colonne6": null

                    },
                    "DHI": {
                        "nameinCSV": "DIF",
                        "unitCoef": 1
                    },
                    "DI": {
                        "nameinCSV": "GHI",
                        "unitCoef": 1
                    },
                    "SolarF": {
                        "nameinCSV": null,
                        "unitCoef": 1
                    },
                    "Windspeed": {
                        "nameinCSV": "WS",
                        "unitCoef": 1
                    },
                    "T24h": {
                        "nameinCSV": "TEMP",
                        "unitCoef": 1
                    },
                    "direct_normal": {
                        "nameinCSV": "DNI",
                        "unitCoef": 1
                    },
                }
            }
        }
        else {
            var oParams = {
                "globalData": {
                    "lat": {
                        "nameinCSV": "Latitude:"
                    },
                    "long": {
                        "nameinCSV": "Longitude:"
                    },
                    "altitude": {
                        "nameinCSV": "Elevation:"
                    },
                },
                "startDataLine": "Month",
                "startDataColumns": "Month",
                "separatorData": ";",

                "timeData": {
                    "TL": {
                        "nameinCSV": null,
                        "unitCoef": 1
                    },
                    "TIME": {// même si on 
                        "nameinCSV": null,
                        "format": "MMM",
                        "Colonne1": "Mois",
                        "Colonne2": null,
                        "Colonne3": null,
                        "Colonne4": null,
                        "Colonne5": null,
                        "Colonne6": null

                    },
                    "DHI": {
                        "nameinCSV": "Diffm",
                        "unitCoef": 1
                    },
                    "DI": {
                        "nameinCSV": "GHIm",
                        "unitCoef": 1
                    },
                    "SolarF": {
                        "nameinCSV": null,
                        "unitCoef": 1
                    },
                    "Windspeed": {
                        "nameinCSV": "WSm",
                        "unitCoef": 1
                    },
                    "T24h": {
                        "nameinCSV": "T24",
                        "unitCoef": 1
                    },
                    "direct_normal": {
                        "nameinCSV": "DNIm",
                        "unitCoef": 1
                    },

                }
            }
        }
    }
    else if (eProvider == "TMY3") {
        var oParams = {
            "globalData": {
                "lat": {
                    "nameinCSV": "Latitude;"
                },
                "long": {
                    "nameinCSV": "Longitude;"
                },
                "altitude": {
                    "nameinCSV": "Altitude;"
                },
            },
            "startDataLine": "Date",
            "startDataColumns": "Date",
            "separatorData": ",",
            "timeData": {
                "TL": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "TIME": {
                    "nameinCSV": null,
                    "format": "MM/DD/YYYY HH:mm",
                    "Colonne1": "Mois/Jour/Annee",
                    "Colonne2": "Heure:Minute",
                    "Colonne3": null,
                    "Colonne4": null,
                    "Colonne5": null,
                    "Colonne6": null

                },
                "DHI": {
                    "nameinCSV": "DHI (W",
                    "unitCoef": 1
                },
                "DI": {
                    "nameinCSV": "GHI (W",
                    "unitCoef": 1
                },
                "SolarF": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "Windspeed": {
                    "nameinCSV": "Wspd (m/s)",
                    "unitCoef": 1
                },
                "T24h": {
                    "nameinCSV": "Dry-bulb (C)",
                    "unitCoef": 1
                },
                "direct_normal": {
                    "nameinCSV": "direct_normal",
                    "unitCoef": 1
                },
            }
        }
    }
    else if (eProvider == "TMY_Solargis") {
        var oParams = {
            "globalData": {
                "lat": {
                    "nameinCSV": "Latitude:"
                },
                "long": {
                    "nameinCSV": "Longitude:"
                },
                "altitude": {
                    "nameinCSV": "Elevation:"
                },
            },
            "startDataLine": "Day",
            "startDataColumns": "Day",
            "separatorData": ";",

            "timeData": {
                "TL": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "TIME": {// même si on 
                    "nameinCSV": null,
                    "format": "DDD HH:mm",
                    "Colonne1": "Day",
                    "Colonne2": "Heure",
                    "Colonne3": null,
                    "Colonne4": null,
                    "Colonne5": null,
                    "Colonne6": null

                },
                "DHI": {
                    "nameinCSV": "DIF",
                    "unitCoef": 1
                },
                "DI": {
                    "nameinCSV": "GHI",
                    "unitCoef": 1
                },
                "SolarF": {
                    "nameinCSV": null,
                    "unitCoef": 1
                },
                "Windspeed": {
                    "nameinCSV": "WS",
                    "unitCoef": 1
                },
                "T24h": {
                    "nameinCSV": "TEMP",
                    "unitCoef": 1
                },
                "direct_normal": {
                    "nameinCSV": "DNI",
                    "unitCoef": 1
                },
            }
        }
    }
    return oParams;
}
function fileImportTMYChanged(e, eProvider, fileTestAuto, Scontents) {

    if (Scontents != null || Scontents != undefined) {
        // var oParams = defineParam(eProvider);
        // $('#div_importTMY_3E_MeteoApi').hide();
        // if (eProvider == "Month_Solargis") {
        //     var varParseTmyFileMonth = parseTMYFileMonth(Scontents, oParams, eProvider);//#6467
        //     return updateMeteoStationFormData1(varParseTmyFileMonth, eProvider, "API_3E");//#6467
        // }
        // else if (eProvider == "TMY_Solargis" || eProvider == "TMY3" || eProvider == "TMY_PVSyst" || eProvider == "TMY_PVGis" || eProvider == "TMY_3E") {
        //     console.log(Scontents, oParams, eProvider)
        //     var varParseTmyFile = parseTMYFile(Scontents, oParams, eProvider); //#6467
        //     console.log(varParseTmyFile);
        //     // var typicalyear = varParseTmyFile.typicalYear;//#6467
        //     // return updateMeteoStationFormData1(varParseTmyFile,eProvider,"API_3E",typicalyear);//#6467
        // }
        // else {
        //     var oParser = new ArchMeteoStreamParser();
        //     oParser.setProvider(eProvider); // Définition du provider de données à utiliser
        //     oParser.set(Scontents); // On value l'attribut m_sCsvData #7499
        //     contents = oParser.load(); // Transformation du contenu au format TMY 'classique' 

        //     if (eProvider != "METEO_Arch") // #6605 quickfix si différent des stations météos archelios .csv car ne contient pas de typicalyear
        //         var typicalyear = oParser.getTypicalYear();
        //     // if(oParser && oParser.m_oProviderRules && oParser.m_oProviderRules.m_oRawData && oParser.m_oProviderRules.m_oRawData.m_oRawDataMap && oParser.m_oProviderRules.m_oRawData.m_oRawDataMap.typicalyear)
        //     //     typicalyear = oParser.m_oProviderRules.m_oRawData.m_oRawDataMap.typicalyear;

        //     if (contents) {
        //         $('#altitudeMeteo').val(oParser.getElevation());
        //         $('#timezoneMeteo').val(oParser.getTimezone());
        //     }
        //     return updateMeteoStationFormData(contents, eProvider, f.name, typicalyear); // Creation d'une station meteo apartir du texte au format TMY 
        // }
    }
    else {
        var files = e.target.files;
        var e_prime = e;
        // if (fileTestAuto != null) {
        //     files = [fileTestAuto];
        //     console.log(fileTestAuto.name)
        // }

        if (files) {
            for (var i = 0, f; f = files[i]; i++) {
                var r = new FileReader();
                r.onload = (function (f) {
                    return function (e) {
                        var Scontents = e.target.result;
                        var oParams = defineParam(eProvider, Scontents);
                        if (eProvider == "Month_Solargis") {
                            if ($('#latitudeMeteo').val() == null || $('#latitudeMeteo').val() == "") {
                                alert(findText("Missing latitude"));
                                return -1;
                            }
                            var varParseTmyFileMonth = parseTMYFileMonth(Scontents, oParams, eProvider);//#6467
                            return updateMeteoStationFormData1(varParseTmyFileMonth, eProvider, f.name);//#6467
                        }
                        else if (eProvider == "TMY_Solargis" || eProvider == "TMY3" || eProvider == "TMY_PVSyst" || eProvider == "TMY_PVGis" || eProvider == "TMY_3E") {
                            var varParseTmyFile = parseTMYFile(Scontents, oParams, eProvider); //#6467
                            console.log("varParseTmyFile:",varParseTmyFile);
                            var typicalyear = varParseTmyFile.typicalYear;
                            console.log("typicalyear:",typicalyear);
                            return updateMeteoStationFormData1(varParseTmyFile, eProvider, f.name, typicalyear);//#6467
                        }
                        else {
                            var oParser = new ArchMeteoStreamParser();
                            oParser.setProvider(eProvider); // Définition du provider de données à utiliser
                            oParser.set(Scontents); // On value l'attribut m_sCsvData #7499
                            contents = oParser.load(); // Transformation du contenu au format TMY 'classique' 

                            if (eProvider != "METEO_Arch") // #6605 quickfix si différent des stations météos archelios .csv car ne contient pas de typicalyear
                                var typicalyear = oParser.getTypicalYear();
                            // if(oParser && oParser.m_oProviderRules && oParser.m_oProviderRules.m_oRawData && oParser.m_oProviderRules.m_oRawData.m_oRawDataMap && oParser.m_oProviderRules.m_oRawData.m_oRawDataMap.typicalyear)
                            //     typicalyear = oParser.m_oProviderRules.m_oRawData.m_oRawDataMap.typicalyear;

                            if (contents) {
                                $('#altitudeMeteo').val(oParser.getElevation());
                                $('#timezoneMeteo').val(oParser.getTimezone());
                            }
                            return updateMeteoStationFormData(contents, eProvider, f.name, typicalyear); // Creation d'une station meteo apartir du texte au format TMY 
                        }
                        // #5836 SBC ajout du format SolarGis Mensuel 
                        /* if(eProvider == "Month_Solargis"){
                                // Parse du contenu du fichier et remplissage de la variable globale metoUpdate
                                var newMeteo = CreateMeteoFromSolargisMonth(contents);
                                // Update de l'IHM
                                UpdateIHMFromMeteoStation(newMeteo);
                        }
                        else
                        {
            
                                var oParser = new ArchMeteoStreamParser();
                                oParser.setProvider(eProvider); // Définition du provider de données à utiliser
                                oParser.set(contents); // On value l'attribut m_sCsvData 
                                contents = oParser.load(); // Transformation du contenu au format TMY 'classique' 
                                
                                if (eProvider != "METEO_Arch") // #6605 quickfix si différent des stations météos archelios .csv car ne contient pas de typicalyear
                                    var typicalyear = oParser.getTypicalYear();
                                // if(oParser && oParser.m_oProviderRules && oParser.m_oProviderRules.m_oRawData && oParser.m_oProviderRules.m_oRawData.m_oRawDataMap && oParser.m_oProviderRules.m_oRawData.m_oRawDataMap.typicalyear)
                                //     typicalyear = oParser.m_oProviderRules.m_oRawData.m_oRawDataMap.typicalyear;
            
                                if(contents){
                                    $('#altitudeMeteo').val(oParser.getElevation());
                                    $('#timezoneMeteo').val(oParser.getTimezone());
                                } 
                                return updateMeteoStationFormData(contents, eProvider, f.name, typicalyear); // Creation d'une station meteo apartir du texte au format TMY 
                        }
                        */

                        // On repasse le sélecteur de fichier à nulle pour autoriser la resélection du même fichier
                        //e_prime.target.value = null;
                    };
                })(f);
                r.readAsText(f, 'UTF-8'); //reader.readAsText(file, encoding);
            }
        }
        else {
            alert(findText("Failed to load files"));
        }
    }
}
function updateMeteoStationFormData1(varParseTmyFile, eProvider, srcFile, typicalyear) {//#6467

    console.log("varParseTmyFile:",varParseTmyFile)
    console.log("typicalyear:",typicalyear);

    var colWindspeed = false;
    var colTL = false;
    var colTemp = false;
    meteoUpdate.typicalyear = null;
    var K = null;
    var K_clear = 0.7191;
    var Beta = 0.193;
    var Gamma = 0.7283;
    var tabIrradMensuelExtra = {
        0: [0, 0, 1.2, 19.3, 37.2, 44.8, 41.2, 26.5, 5.4, 0, 0, 0],//lat90
        1: [0, 0, 2.2, 19.2, 37, 44.7, 41, 26.4, 6.4, 0, 0, 0],
        2: [0, 0, 2.2, 19.2, 37, 44.7, 41, 26.4, 6.4, 0, 0, 0],
        3: [0, 0, 4, 7, 19.6, 36.6, 44.2, 40.5, 26.1, 9, 0.6, 0, 0],
        4: [0, 0.7, 7.8, 21, 35.9, 43.3, 39.8, 26.3, 11.9, 2.2, 0, 0],
        5: [0.1, 2.7, 10.9, 23.1, 35.3, 42.1, 38.7, 27.5, 14.8, 4.9, 0.3, 0],
        6: [1.2, 5.4, 13.9, 25.4, 35.7, 41, 38.3, 29.2, 17.7, 7.8, 2, 0.4],
        7: [3.5, 8.3, 16.9, 27.6, 36.6, 41, 38.8, 30.9, 20.5, 10.8, 4.5, 2.3],
        8: [6.2, 11.3, 19.8, 29.6, 37.6, 41.3, 39.4, 32.6, 23.1, 13.8, 7.3, 4.8],
        9: [9.1, 14.4, 22.5, 31.5, 38.5, 41.5, 40, 34.1, 25.5, 16.7, 10.3, 7.7],
        10: [12.2, 17.4, 25.1, 33.2, 39.2, 41.7, 40.4, 35.3, 27.8, 19.6, 13.3, 10.7],//lat45
        11: [15.3, 20.3, 27.4, 34.6, 39.7, 41.7, 40.6, 36.4, 29.8, 22.4, 16.4, 13.7],
        12: [18.3, 23.1, 29.6, 35.8, 40, 41.5, 40.6, 37.3, 31.7, 25, 19.3, 16.8],
        13: [21.3, 25.7, 31.5, 36.8, 40, 41.1, 40.4, 37.8, 33.2, 27.4, 22.2, 19.9],
        14: [24.2, 28.2, 33.2, 37.5, 39.8, 40.4, 40, 38.2, 34.6, 29.6, 25, 22.9],
        15: [27, 30.5, 34.7, 37.9, 39.3, 39.5, 39.3, 38.2, 35.6, 31.6, 27.7, 25.8],
        16: [29.6, 32.6, 35.9, 38, 38.5, 38.4, 38.3, 38, 36.4, 33.4, 30.1, 28.5],
        17: [32, 34.4, 36.8, 37.9, 37.5, 37, 37.1, 37.5, 37, 35, 32.4, 31.1],
        18: [34.2, 36, 37.5, 37.4, 36.3, 35.3, 35.6, 36.7, 37.2, 36.3, 34.5, 33.5],
        19: [36.2, 37.4, 37.8, 36.7, 34.8, 33.5, 34, 35.7, 37.2, 37.3, 36.3, 35.7],//lat0
        20: [38, 38.5, 37.9, 35.8, 33, 31.4, 32.1, 34.4, 36.9, 38, 37.9, 37.6],
        21: [39.5, 39.3, 37.7, 34.5, 31.1, 29.2, 29.9, 32.9, 36.3, 38.5, 39.3, 39.4],
        22: [40.8, 39.8, 37.2, 33, 28.9, 26.8, 27.6, 31.1, 35.4, 38.7, 40.4, 40.9],
        23: [41.8, 40, 36.4, 31.3, 26.6, 24.2, 25.2, 29.1, 34.3, 38.6, 41.2, 42.1],
        24: [42.5, 40, 35.4, 29.3, 24.1, 21.5, 22.6, 27, 32.9, 38.2, 41.7, 43.1],
        25: [43, 39.7, 34, 27.2, 21.4, 18.7, 19.9, 24.6, 31.2, 37.6, 42, 43.8],
        26: [43.2, 39.1, 32.5, 24.8, 18.6, 15.8, 17, 22.1, 29.3, 36.6, 42, 44.2],
        27: [43.1, 38.2, 30.6, 22.3, 15.8, 12.9, 14.2, 19.4, 27.2, 35.5, 41.7, 44.5],
        28: [42.8, 37.1, 28.6, 19.6, 12.9, 10, 11.3, 16.6, 24.9, 34, 41.2, 44.5],//lat-45
        29: [42.3, 35.7, 26.3, 16.8, 10, 7.2, 8.4, 13.7, 22.4, 32.4, 40.5, 44.3],
        30: [41.7, 34.1, 23.9, 13.9, 7.2, 4.5, 5.7, 10.9, 19.8, 30.5, 39.6, 44],
        31: [41, 32.4, 21.2, 10.9, 4.5, 2.2, 3.1, 8, 17, 28.4, 38.7, 43.7],
        32: [40.5, 30.6, 18.5, 7.9, 2.1, 0.3, 1, 5.2, 14.1, 26.2, 37.8, 43.7],
        33: [40.8, 28.8, 15.6, 5, 0.4, 0, 0, 2.6, 11.1, 24, 37.4, 44.9],
        34: [41.9, 27.6, 12.6, 2.4, 0, 0, 0, 0.8, 8, 21.9, 38.1, 46.2],
        35: [42.7, 27.4, 9.7, 0.6, 0, 0, 0, 0, 5, 20.6, 38.8, 47.1],
        36: [43.2, 27.7, 7.2, 0, 0, 0, 0, 0, 2.4, 20.3, 39.3, 47.6],
        37: [43.3, 27.8, 6.2, 0, 0, 0, 0, 0, 1.4, 20.4, 39.4, 47.8]//-lat90
    };
    var TabSolarFraction = [90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25, -30, -35, -40, -45, -50, -55, -60, -65, -70, -75, -80, -85, -90];
    var nbjours = [31.0, 28.0, 31.0, 30.0, 31.0, 30.0, 31.0, 31.0, 30.0, 31.0, 30.0, 31.0];
    if (varParseTmyFile.ValeursGlobales.Latitude == null) {
        varParseTmyFile.ValeursGlobales.Latitude = parseFloat($('#latitudeMeteo').val());
    }
    if (varParseTmyFile.ValeursGlobales.Longitude == null) {
        varParseTmyFile.ValeursGlobales.Longitude = parseFloat($('#longitudeMeteo').val());
    }
    if (varParseTmyFile.ValeursGlobales.Altitude == null) {
        varParseTmyFile.ValeursGlobales.Altitude = parseFloat($('#altitudeMeteo').val());
    }

    meteoUpdate.typicalyear = typicalyear;

    // var fromWindow = $("#mainWindows").val();
    // if (typeof (typicalyear) != "undefined" && fromWindow != "database"/*#6389*/) { // #5761
    //     meteoUpdate.typicalyear = typicalyear;
    //     $("#importTMYDATA_div").show();
    //     //#6284
    //     // var accessTMY = moduleVerify("TMY_8760",0, false,false,false);
    //     // if(accessTMY.valide){
    //     //     $("#importTMYDATA_checkbox").prop( "checked", true);
    //     // }else{
    //     //     $("#importTMYDATA_checkbox").prop( "checked", false);
    //     // }
    // } else {
    //     $("#importTMYDATA_div").hide();
    // }
    var x = Math.abs(varParseTmyFile.ValeursGlobales.Latitude - TabSolarFraction[0]);
    var dataSolarFraction = 0;

    if (varParseTmyFile.ValeursMensuelles[1].SolarF == null) {

        for (var y = 1; y <= TabSolarFraction.length; y++) {
            if (x >= Math.abs(varParseTmyFile.ValeursGlobales.Latitude - TabSolarFraction[y])) {
                x = Math.abs(varParseTmyFile.ValeursGlobales.Latitude - TabSolarFraction[y]);
                dataSolarFraction = y + 1;
            }
        }
    }
    if (varParseTmyFile != null) {
        for (var i = 0; i < meteoUpdate.diffusmensuel.length; i++) {
            meteoUpdate.directmensuel[i] = varParseTmyFile.ValeursMensuelles[i].Direct_Normal;
            meteoUpdate.diffusmensuel[i] = varParseTmyFile.ValeursMensuelles[i].Diffuse_Horizontal;
            if (varParseTmyFile.ValeursMensuelles[i].SolarF == null) {
                K = varParseTmyFile.ValeursMensuelles[i].Globale_Horizontale / ((tabIrradMensuelExtra[dataSolarFraction][i] / 3.6) * nbjours[i]);
                meteoUpdate.solarfraction[i] = parseFloat(Math.pow(((K / K_clear - Beta) / (1 - Beta)), (1 / Gamma)).toFixed(3));
            }
            else {
                meteoUpdate.solarfraction[i] = varParseTmyFile.ValeursMensuelles[i].SolarF;
            }
            //meteoUpdate.solarfraction[i] = 1-(varParseTmyFile.ValeursMensuelles[i].Diffuse_Horizontal)/(varParseTmyFile.ValeursMensuelles[i].Direct_Normal);
            meteoUpdate.temperature[i] = varParseTmyFile.ValeursMensuelles[i].Temperature;
            meteoUpdate.vitessevent[i] = varParseTmyFile.ValeursMensuelles[i].WindSpeed;
            meteoUpdate.linktrouble[i] = 0;

            if (varParseTmyFile.ValeursMensuelles[i].WindSpeed === null) {
                colWindspeed = false;
            }
            else {
                colWindspeed = true;
            }
            if (varParseTmyFile.ValeursMensuelles[i].TL === null) {
                colTL = false;
            }
            else {
                colTL = true;
            }
            if (varParseTmyFile.ValeursMensuelles[i].Temperature === null) {
                colTemp = false;
            }
            else {
                colTemp = true;
            }


        }

        meteoUpdate.source = srcFile;
    }

    $('#latitudeMeteo').val(number_format(varParseTmyFile.ValeursGlobales.Latitude, 3));
    $('#longitudeMeteo').val(number_format(varParseTmyFile.ValeursGlobales.Longitude, 3));
    $('#altitudeMeteo').val(varParseTmyFile.ValeursGlobales.Altitude, 2);

    $('#commentsMeteo').val(meteoUpdate.source);  //#5607



    if (!colWindspeed) {

        meteoUpdate.vitessevent = [3.1, 3.3, 3.7, 4.1, 4.0, 3.9, 3.9, 3.6, 3.3, 3.1, 3.0, 3.0]; // climat aride
        if ($('#climateMeteo').val() == 1) { // Chinese
            meteoUpdate.vitessevent = [3.5, 3.6, 3.8, 3.8, 3.5, 3.4, 3.3, 3.3, 3.4, 3.3, 3.1, 3.3];
        }
        else if ($('#climateMeteo').val() == 2) { // Continental
            meteoUpdate.vitessevent = [3.5, 3.6, 3.6, 3.8, 3.6, 3.2, 3.0, 3.0, 3.1, 3.4, 3.5, 3.5];
        }
        else if ($('#climateMeteo').val() == 3) { // Mediterranean
            meteoUpdate.vitessevent = [3.8, 4.0, 3.8, 4.2, 3.9, 3.6, 3.6, 3.5, 3.4, 3.6, 3.9, 4.1];
        }
        else if ($('#climateMeteo').val() == 4) { //Mountainous
            meteoUpdate.vitessevent = [4.5, 4.6, 4.6, 4.5, 4.2, 4.0, 3.8, 3.7, 3.9, 4.2, 4.4, 4.5];
        }
        else if ($('#climateMeteo').val() == 5) { //Oceanic
            meteoUpdate.vitessevent = [3.9, 3.9, 3.8, 3.8, 3.4, 3.3, 3.3, 3.0, 3.2, 3.4, 3.6, 3.7];
        }
        else if ($('#climateMeteo').val() == 6) { //Polar
            meteoUpdate.vitessevent = [6.3, 6.3, 6.1, 6.0, 6.3, 5.8, 6.0, 6.3, 7.2, 7.6, 6.7, 6.7];
        }
        else if ($('#climateMeteo').val() == 7) { //Tropical
            meteoUpdate.vitessevent = [3.5, 3.6, 3.6, 3.5, 3.3, 3.1, 3.1, 3.0, 2.8, 2.7, 3.0, 3.1];
        }
    }
    if (!colTL) {

        // à voir si on récupère les données depuis SODA, ou plus proche station METEONorm, ou autre ... : laisser le choix à l'utilisateur
        // pour l'instant on fait comme les autres données, on met des données moyennes par climat :
        meteoUpdate.linktrouble = [3.3, 3.41, 3.58, 3.85, 3.88, 3.76, 3.84, 3.81, 3.65, 3.45, 3.23, 3.14]; // climat aride
        if ($('#climateMeteo').val() == 1) { // Chinese
            meteoUpdate.linktrouble = [3.54, 3.73, 4.20, 4.38, 4.22, 4.23, 3.99, 4.0, 3.9, 3.81, 3.5, 3.4];
        }
        else if ($('#climateMeteo').val() == 2) { // Continental
            meteoUpdate.linktrouble = [2.76, 3.0, 3.07, 3.19, 3.21, 3.21, 3.23, 3.15, 2.89, 2.7, 2.64, 2.57];
        }
        else if ($('#climateMeteo').val() == 3) { // Mediterranean
            meteoUpdate.linktrouble = [2.74, 2.9, 3.17, 3.26, 3.37, 3.44, 3.55, 3.49, 3.27, 3.09, 2.81, 2.72];
        }
        else if ($('#climateMeteo').val() == 4) { //Mountainous
            meteoUpdate.linktrouble = [2.58, 2.8, 2.99, 3.08, 2.99, 2.99, 3.06, 3.06, 2.84, 2.77, 2.6, 2.49];
        }
        else if ($('#climateMeteo').val() == 5) { //Oceanic
            meteoUpdate.linktrouble = [2.87, 3.07, 3.33, 3.43, 3.38, 3.42, 3.37, 3.35, 3.11, 3.03, 2.91, 2.82];
        }
        else if ($('#climateMeteo').val() == 6) { //Polar
            meteoUpdate.linktrouble = [1.91, 2.62, 2.7, 3.0, 2.97, 2.95, 2.92, 2.86, 2.69, 2.56, 2.22, 1.65];
        }
        else if ($('#climateMeteo').val() == 7) { //Tropical
            meteoUpdate.linktrouble = [3.88, 3.89, 4.08, 4.07, 4.12, 4.27, 4.24, 4.12, 3.97, 3.89, 3.75, 3.75];
        }
    }

    if (!colTemp) {

        meteoUpdate.temperature = [10.0, 12.0, 15.9, 20.0, 24.6, 28.7, 31.1, 30.2, 26.6, 21.3, 15.1, 10.8];
        if ($('#climateMeteo').val() == 1) { // Chinese
            meteoUpdate.temperature = [9.3, 10.6, 13.6, 17.7, 21.3, 24.2, 26.3, 26.2, 23.7, 19.4, 15.1, 10.8];
        }
        else if ($('#climateMeteo').val() == 2) { // Continental
            meteoUpdate.temperature = [-7.8, -5.8, -1.0, 6.3, 12.5, 17.7, 20.6, 19.5, 14.7, 8.0, 1.1, -4.9];
        }
        else if ($('#climateMeteo').val() == 3) { // Mediterranean
            meteoUpdate.temperature = [8.8, 9.4, 11.9, 14.1, 18.2, 22.5, 24.7, 24.9, 21.5, 17.7, 12.8, 9.7];
        }
        else if ($('#climateMeteo').val() == 4) { //Mountainous
            meteoUpdate.temperature = [-0.9, 0.1, 2.6, 5.2, 8.6, 10.9, 12.0, 11.9, 9.5, 6.6, 2.5, -0.3];
        }
        else if ($('#climateMeteo').val() == 5) { //Oceanic
            meteoUpdate.temperature = [2.8, 3.7, 6.9, 9.8, 14.1, 17.3, 19.1, 19.1, 15.7, 11.7, 6.7, 3.7];
        }
        else if ($('#climateMeteo').val() == 6) { //Polar
            meteoUpdate.temperature = [-24.3, -24.5, -22.4, -15.8, -6.5, 1.2, 4.3, 2.3, -3.0, -10.3, -16.9, -19.8];
        }
        else if ($('#climateMeteo').val() == 7) { //Tropical
            meteoUpdate.temperature = [23.3, 23.8, 24.9, 25.8, 26.6, 26.8, 26.6, 26.6, 26.8, 26.6, 25.4, 23.8];
        }
    }

    if (varParseTmyFile.ValeursGlobales.Latitude != null) {
        if (number_format(varParseTmyFile.ValeursGlobales.Latitude, 3) < 0.0) // si latitude est négative alors on est dans l'hémisphère sud, donc on décale de 6 mois les données moyennes par défaut
        {
            var vv = meteoUpdate.vitessevent;
            var t = meteoUpdate.temperature;
            var tl = meteoUpdate.linktrouble;
            for (var m1 = 0; m1 < 6; m1++) {
                if (!colWindspeed)
                    meteoUpdate.vitessevent[m1] = vv[m1 + 6];
                if (!colTL)
                    meteoUpdate.linktrouble[m1] = tl[m1 + 6];
                if (!colTemp)
                    meteoUpdate.temperature[m1] = t[m1 + 6];
            }
            for (var m2 = 6; m2 < 12; m2++) {
                if (!colWindspeed)
                    meteoUpdate.vitessevent[m2] = vv[m2 - 6];
                if (!colTL)
                    meteoUpdate.linktrouble[m2] = tl[m2 - 6];
                if (!colTemp)
                    meteoUpdate.temperature[m2] = t[m2 - 6];
            }
        }
    }
    updateMeteoGraphs(numGraph);
    var sProvider = "PVGIS";
    if (eProvider) {
        switch (eProvider) {
            case EProvider.TMY_PVGis:
                sProvider = "PVGIS";
                break;
            case EProvider.TMY3:
                sProvider = "TMY3";
                break;
            case EProvider.TMY_3E:
                sProvider = "TMY_3E";
                break;
            case EProvider.TMY_PVSyst:
                sProvider = "PVSYST";
                break;
            case EProvider.TMY_Solargis:
                sProvider = "SOLARGIS";
                break;
            case EProvider.TMY:

            case EProvider.TMY2:
                sProvider = "TMY";
                break;
            default:
                sProvider = "IMPORT";
                break;
        }

        if (meteoUpdate.source == "API_3E") {
            $('#nameMeteo').val("API_3E" + "_" + $('#latitudeMeteo').val() + "_" + $('#longitudeMeteo').val());
        }
        else {
            $('#nameMeteo').val(sProvider + "_" + $('#latitudeMeteo').val() + "_" + $('#longitudeMeteo').val());
        }
    }
}

//parseTMYFile(sContent,oParams);

//function parseTMYFile(sContent,oParams){

//}

// #5836 ajout format "SolargisMonth"
$("#fileImportMonth_Solargis").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.Month_Solargis, fileTestAuto);
});

$("#fileImportTMY_NRELv3").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.TMY3, fileTestAuto);
});

$("#fileImportTMY_PVSyst").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.TMY_PVSyst, fileTestAuto);
});

$("#fileImportTMY_PVGis").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.TMY_PVGis, fileTestAuto);
});

$("#fileImportTMY_Helioclim_PVSyst").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.TMY_PVSyst, fileTestAuto);
});

$("#fileImportTMY_Helioclim_NRELv3").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.TMY3, fileTestAuto);
});

$("#fileImportTMY_Solargis").change(function (e, fileTestAuto) {

    // triggerTMYImportDlg('fileImportTMY_Solargis')
    fileImportTMYChanged(e, EProvider.TMY_Solargis, fileTestAuto);
});
$("#fileImportTMY_3E").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.TMY_3E, fileTestAuto);
});
$("#fileImportTMY_Solargis3").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.TMY3, fileTestAuto);
});

$("#fileImportMeteo_Arch").change(function (e, fileTestAuto) {
    fileImportTMYChanged(e, EProvider.METEO_Arch, fileTestAuto);
});

//NO 451 ajouter module dans la BDD
function addMeteoBDD() {
    /*if (accessPRO != "1"){ // NO 1207
        alert(findText("This feature is only available with a PRO version.")+"\n"+findText("You can access to this feature by buying Archelios PRO."));
        return;
    }*/
    //#5084
    var accessFeature = moduleVerify("edit_database_weather", 0, true);
    if (!accessFeature.valide) {
        return;
    }

    var name;

    //on teste si toutes les données sont présentes :
    if ($('#nameMeteo').val() == "") {
        alert(findText("Missing meteo station name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameMeteo').val());

    var r = testMeteoValues();
    if (r == -1)
        return;

    var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    var meteo = getMeteoFromCharacteristics();
    meteo.name = name;
    meteo.uid = guidnew;

    if (meteo.typicalyear != null) {
        //#6284
        if ($("#importTMYDATA_checkbox").is(':checked')) {
            var accessFeature = moduleVerify("TMY_8760", 0, true);
            if (!accessFeature.valide) {
                return;
            }
        } else {
            delete meteo.typicalyear;
        }
    }

    clic_on_button('addMeteoBDD', 0);

    //console.log(meteo);
    addOrUpdateMeteoInBDD(meteo);
    if (typeof partner == "undefined" || (typeof partner != "undefined") && partner != "Sungrow") { // on ne fait pas de reselect pour Sungrow sinon tourne en boucle
        $('#select_meteo').trigger('change');
    }
    //$('#characteristicsMeteoModal').modal('hide') ;
}

//#4704 Interdire les stations ajoutées manuellement avec un trouble de Linke à 0
//bBDD -> true si c'est pour le test avant ajout ou modif BDD, false si c'est pour tester avant un calcul de PROD
function checkValidityMeteo(meteo, bBDD, bAlertDisplay) {
    if (typeof (bAlertDisplay) == "undefined")
        bAlertDisplay = true;

    var bError = false;
    var msgError = "";

    var fLimitMinLinkeTrouble = 1, fLimitMaxLinkeTrouble = 20;//#6719
    var fLimitMinDirectMonthly = 0, fLimitMaxDirectMonthly = 400, fLimitMinDirectYearly = 40, fLimitMaxDirectYearly = 2600;
    var fLimitMinGlobalMonthly = 0, fLimitMaxGlobalMonthly = 500, fLimitMinGlobalYearly = 400, fLimitMaxGlobalYearly = 3200;
    var fLimitMinSolarFraction = 0.01, fLimitMaxSolarFraction = 1, fLimitAverageMinSolarFraction = 0.05, fLimitAverageMaxSolarFraction = 0.95;
    var fLimitMinWindSpeed = 0, fLimitMaxWindSpeed = 100;
    var fLimitMinTemperature = -50, fLimitMaxTemperature = 50;
    var yearlyGlobal = 0, yearlyDirect = 0, averageSolarFraction = 0;

    for (var i = 0; i < 12; i++) {
        // #4704 : mettre 2 en valeur par défaut
        var fLinkeTrouble = roundDecimal(meteo.linktrouble[i]);
        var fDirectMonthly = roundDecimal(meteo.directmensuel[i]);
        var fSolarFractionMonthly = roundDecimal(meteo.solarfraction[i]);
        var fWindSpeedMonthly = roundDecimal(meteo.vitessevent[i]);
        var fTemperatureMonthly = roundDecimal(meteo.temperature[i]);

        if (fLinkeTrouble <= fLimitMinLinkeTrouble) {// au moins une valeur n'est pas correcte, on prévient l'utilisateur
            msgError = findText("Your station has a Linke trouble (air turbidity) of less than XXX for at least one month of the year.").replace("XXX", fLimitMinLinkeTrouble);
        }
        // #5435 éviter d'ajouter de fausses données météo
        if (fLinkeTrouble > fLimitMaxLinkeTrouble) {
            msgError = findText("Your station has a Linke trouble (air turbidity) greater than XXX for at least one month of the year.").replace("XXX", fLimitMaxLinkeTrouble);
        }

        yearlyDirect += fDirectMonthly;
        if (fDirectMonthly < fLimitMinDirectMonthly) {
            msgError = findText("Your station has direct irradiation below XXX kWh/m² for at least one month of the year.").replace("XXX", fLimitMinDirectMonthly);
        }
        else if (fDirectMonthly > fLimitMaxDirectMonthly) {
            msgError = findText("Your station has direct irradiation greater than XXX kWh/m² for at least one month of the year.").replace("XXX", fLimitMaxDirectMonthly);
        }

        var globalMonthly = fDirectMonthly + roundDecimal(meteo.diffusmensuel[i]);
        yearlyGlobal += globalMonthly;
        if (globalMonthly < fLimitMinGlobalMonthly) {
            msgError = findText("Your station has global irradiation below XXX kWh/m² for at least one month of the year.").replace("XXX", fLimitMinGlobalMonthly);
        }
        else if (globalMonthly > fLimitMaxGlobalMonthly) {
            msgError = findText("Your station has global irradiation greater than XXX kWh/m² for at least one month of the year.").replace("XXX", fLimitMaxGlobalMonthly);
        }

        averageSolarFraction += fSolarFractionMonthly;
        if (fSolarFractionMonthly < fLimitMinSolarFraction) {
            msgError = findText("Your station has sunshine fraction below XXX % for at least one month of the year.").replace("XXX", fLimitMinSolarFraction);
        }
        else if (fSolarFractionMonthly > fLimitMaxSolarFraction) {
            msgError = findText("Your station has sunshine fraction greater than XXX % for at least one month of the year.").replace("XXX", fLimitMaxSolarFraction);
        }

        if (fWindSpeedMonthly < fLimitMinWindSpeed) {
            msgError = findText("Your station has wind speed below XXX m/s for at least one month of the year.").replace("XXX", fLimitMinWindSpeed);
        }
        else if (fWindSpeedMonthly > fLimitMaxWindSpeed) {
            msgError = findText("Your station has wind speed greater than XXX m/s for at least one month of the year.").replace("XXX", fLimitMaxWindSpeed);
        }

        if (fTemperatureMonthly < fLimitMinTemperature) {
            msgError = findText("Your station has temperature below XXX°C for at least one month of the year.").replace("XXX", fLimitMinTemperature);
        }
        else if (fTemperatureMonthly > fLimitMaxTemperature) {
            msgError = findText("Your station has temperature greater than XXX°C for at least one month of the year.").replace("XXX", fLimitMaxTemperature);
        }
    } // on met en forme pour mettre les données dans la BDD

    averageSolarFraction /= 12;

    if (yearlyDirect < fLimitMinDirectYearly) {
        msgError += "\n" + findText("Your station has a direct irradiation for the year below XXX kWh/m².").replace("XXX", fLimitMinDirectYearly);
    }
    else if (yearlyDirect > fLimitMaxDirectYearly) {
        msgError += "\n" + findText("Your station has a direct irradiation for the year greater than XXX kWh/m².").replace("XXX", fLimitMaxDirectYearly);
    }

    if (yearlyGlobal < fLimitMinGlobalYearly) {
        msgError += "\n" + findText("Your station has a global irradiation for the year below XXX kWh/m².").replace("XXX", fLimitMinGlobalYearly);
    }
    else if (yearlyGlobal > fLimitMaxGlobalYearly) {
        msgError += "\n" + findText("Your station has a global irradiation for the year greater than XXX kWh/m².").replace("XXX", fLimitMaxGlobalYearly);
    }

    if (averageSolarFraction < fLimitAverageMinSolarFraction) {
        msgError += "\n" + findText("Your station has an average of sunshine fraction below XXX %.").replace("XXX", fLimitAverageMinSolarFraction);
    }
    else if (averageSolarFraction > fLimitAverageMaxSolarFraction) {
        msgError += "\n" + findText("Your station has an average of sunshine fraction greater than XXX %.").replace("XXX", fLimitAverageMaxSolarFraction);
    }

    if (msgError != "") {// #4704 prévenir l'utilisateur
        bError = true;
        var msgForModification = findText("Please check the input data before adding or modifying.");
        if (!bBDD)
            msgForModification = findText("Please update your weather station before running a production calculation.");

        if (bAlertDisplay)
            alert(msgError + "\n" + msgForModification);
    }

    return !bError;
}

// fonction qui renvoie true si on est depuis la page de BDD, sinon renvoie false
function checkIfDatabasePage() {
    var path = window.location.hash; // hash pour récupérer l'ancre
    var posDatabasePage = path.search("manageDatabase.php");

    if (posDatabasePage >= 0) // on est sur la page de la BDD
        return true;

    return false;
}

function addOrUpdateMeteoInBDD(meteo, sUpdate) {
    //#5435 : interdire l'ajout de données s'il y a une erreur, et ne pas juste afficher une alerte !
    if (checkValidityMeteo(meteo, true, true)) { // si pas d'erreurs dans les données
        var sAction = "addMeteo"; // par défaut on ajoute la station (l'uid ne doit pas exister)
        if (sUpdate == "update") {
            sAction = "updateMeteo";
        }

        $.ajaxSetup({ async: false });
        var typicalyear = null; // on passe par un intermédiaire, car après avoir parsé, l'utilisateur peut encore refuser d'ajouter la météo...
        var bDataBasePage = checkIfDatabasePage();
        //console.log("bDataBasePage = ", bDataBasePage);
        if (!bDataBasePage && meteo.hasOwnProperty("typicalyear")) {
            typicalyear = meteo.typicalyear;
            delete meteo.typicalyear; // pour ne pas l'envoyer dans la requête d'ajout
        }

        var datasend = 'actionBDD=' + sAction + '&meteo=' + JSON.stringify(meteo);

        //console.log("add meteo ", datasend);
        $.ajax({
            type: "POST",
            url: './ajax/requetes.php5',
            data: datasend,
            success: function (msg) {
                //console.log("success add meteo", msg);
                var bDuplicate = false; // #5761
                if (msg.indexOf("DUPLICATE:") == 0) // c'est notre mot clé qui est trouvé (1ère position pour être plus sûr)
                    bDuplicate = true;

                if (typeof partner == "undefined" || (typeof partner != "undefined") && partner != "Sungrow") { // on ne fait pas de reselect pour Sungrow sinon tourne en boucle
                    if (!bDataBasePage) { // on est sur la page des projets
                        $("#meteo_name")[0].textContent = meteo.name;
                        // #5761 SERENDI PV stockage des données TMY au pas horaire sur le site
                        if (typicalyear != null)
                            jsonContentForMasks.site.typicalyear = typicalyear;

                        recomputeAP("meteo", 1);
                        displayOrHideWeatherHourlyProfileChart();

                        if (bDuplicate)
                            selectMeteo(msg.substr(10)); // on sélectionne la météo qui est identique, juste après "DUPLICATE:" (10 caractères pour le mot clé)
                        else
                            selectMeteo(meteo.uid);
                    }
                    else {
                        updateMeteoList(meteo.uid);
                    }

                    //$('#select_meteo').trigger('change'); NO 726 triger change par defaut apres le select
                    if (!bDuplicate) // ce n'est pas notre mot clé qui est trouvé
                        alert(msg); // NO 526 mettre l'alert après select et change pour gagner du temps
                    else
                        alert(findText("The weather station already exists."));

                    $('#characteristicsMeteoModal').modal('hide'); //NO 526
                    $("#importTMYDATA").hide();//#6284

                    if (!bDataBasePage) // on est sur la page des projets
                        alert(findText("To take into account the changes remember to recompute")); // #2502    
                }
                else { // Uniquement pour Sungrow !!
                    newMeteoSG.name = meteo.name;
                    // pour Sungrow on renvoie le nouvel uid de la BDD (surtout si doublon !)
                    if (bDuplicate)
                        newMeteoSG.uid = msg.substr(10); // on sélectionne la météo qui est identique, juste après "DUPLICATE:" (10 caractères pour le mot clé)
                    else
                        newMeteoSG.uid = meteo.uid;
                }
                //$('#select_meteo').trigger('change');NO 726 triger change par defaut apres le select
            }
        });
    }
}

function editMeteo() {
    /*if (accessPRO != "1"){ // NO 1207
        alert(findText("This feature is only available with a PRO version.")+"\n"+findText("You can access to this feature by buying Archelios PRO."));
        return;
    }*/
    clic_on_button('online_edit_weather', 0);
    //#5084
    var accessFeature = moduleVerify("edit_database_weather", 0, true);
    if (!accessFeature.valide) {
        return;
    }

    $('#btn_addmeteo').hide();
    $('#div_importWeatherFiles').hide(); // NO 855: remplacer du bouton par dropdown menu // $('#btn_importPVGismeteo').hide();
    $('#btn_editmeteo').show();
    $('#bAddMeteo').val("false"); // on a cliqué sur l'édition et non l'ajout
    seeCharacteristicsMeteoSelect(1);
}
// NO 451 éditer/dupliquer dans la BDD
function editMeteoBDD() {
    var name = "--";
    //on teste si toutes les données sont présentes :
    if ($('#nameMeteo').val() == "") {
        alert(findText("Missing meteo station name"));
        return;
    }
    else
        name = decodeURIComponent($('#nameMeteo').val());

    var r = testMeteoValues();
    if (r == -1)
        return;

    var meteo = getMeteoFromCharacteristics();
    meteo.name = name;

    if (meteoUpdate.creator == "1") {
        var answer = confirm(findText('This meteo station is part of the official database Archelios') + '. ' + findText('Do you want to duplicate it with the changes made?'));
        if (answer) { // YES
            var guidnew = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            meteo.uid = guidnew; // on génère un nouvel uid, car plus la même météo !


            //console.log("creator = 1 and duplicate" , meteo);
            addOrUpdateMeteoInBDD(meteo);
        }
    }
    else {

        // ce n'est pas une météo "officielle", on l'édite, met à jour directement
        var answer = confirm(findText('This meteo station already exists') + '. ' + findText('Are you sure you want to update it (this will impact all your projects with this meteo station)?'));
        if (answer) { // YES
            meteo.uid = $('#select_meteo').val().split("!")[0];
            document.getElementById('meteo_name').innerHTML = decodeURIComponent(meteo.name);//#6766
            addOrUpdateMeteoInBDD(meteo, "update");
        }
    }
}

function deleteMeteo() {
    /*if (accessPRO != "1"){ // NO 1207
        alert(findText("This feature is only available with a PRO version.")+"\n"+findText("You can access to this feature by buying Archelios PRO."));
        return;
    }*/
    clic_on_button('online_delete_weather', 0);
    //#5084
    var accessFeature = moduleVerify("edit_database_weather", 0, true);
    if (!accessFeature.valide) {
        return;
    }

    if ($('#select_meteo').val() != null) {
        var uidmeteo = $('#select_meteo').val().split("!")[0]; // que si une seule valeur, d'où le test juste avant
        var creator = "1"; // par défaut officielle
        var datasend = 'actionBDD=findCreatorMeteo&uidmeteo=' + uidmeteo;
        $.ajaxSetup({ async: false });
        $.ajax({
            type: "POST",
            url: './ajax/requetes.php5',
            data: datasend,
            success: function (msg) {
                //console.log("success creator meteo: ", msg);
                creator = msg;
            }
        });
        //console.log("creator meteo: ",creator);
        if (creator == "1") {
            alert(findText('This meteo station is part of the official database Archelios') + '. ' + findText('This meteo station can not be deleted') + '.');
        }
        else {
            var answer = confirm($('#select_meteo option:selected').text() + ": " + findText('Do you really want to delete this meteo station?') + ' ' + findText('This option will affect all your projects with this meteo station.') + ' ' + findText('Irrevocable option.'));

            if (answer) { // YES
                var datasend = 'actionBDD=deleteMeteo&uidmeteo=' + uidmeteo;
                $.ajax({
                    type: "POST",
                    url: './ajax/requetes.php5',
                    data: datasend,
                    success: function (msg) {
                        console.log("success delete meteo", msg);
                        alert(msg);
                        if (checkIfDatabasePage())
                            updateMeteoList();
                        else
                            validate_location(0, 0); // pour recalculer avec la 1ère météo dans la liste (la plus proche)
                    }
                });
            }
        }
    }
}

var $chrt_border_color = "#efefef";
var meteo_options = {
    series: {
        lines: { show: true, lineWidth: 2, fill: false, fillColor: { colors: [{ opacity: 0.1 }, { opacity: 0.15 }] } },
        points: { show: true },
        shadowSize: 0
    },
    selection: {},
    grid: { hoverable: true, clickable: true, tickColor: $chrt_border_color, borderWidth: 0, borderColor: $chrt_border_color },
    tooltip: true,
    tooltipOpts: { content: "<b>%y </b>", defaultTheme: false },
    colors: ["#CC0000", "#FFCC00", "#00CC00", "#0000FF", "#60747C", "#788990"],
    //  rouge, jaune, vert , bleu
    yaxis: { min: 0.0, max: 1500.0 },
    xaxis: {
        min: 0, max: 13,
        ticks: [[1, "j"], [2, "f"], [3, "m"], [4, "a"], [5, "m"], [6, "j"], [7, "j"], [8, "a"], [9, "s"], [10, "o"], [11, "n"], [12, "d"]]
    }
};
var plot_editmeteo_graph;
var numGraph = 0; // savoir sur quel graphe on édite
var oldNumGraph = 0;
var newpointx, newpointy;
//NO 458 : add/edit/duplicate/delete a meteo station
// $('#characteristicsMeteoModal').on('shown.bs.modal', function (e) { // on doit montrer le graphique APRES la modal, sinon ne s'affiche pas
//     //console.clear();  -> enlever car sur Safari ne passe pas ...
//     if ($('#bAddMeteo').val() == "false") {
//         var res = $('#select_meteo').val().split("!");
//         if (res.length > 0)
//             meteoUpdate = findMeteo(res[0]);
//         //console.log("updateMeteo: ", meteoUpdate);
//     }
//     else { // pour l'ajout on part de 0
//         meteoUpdate = {
//             "creator": userid,
//             "directmensuel": [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // on part de 10 sinon ne fonctionne pas quand on clique sur le graphe...
//             "diffusmensuel": [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // on part de 10 sinon ne fonctionne pas...
//             "solarfraction": [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // 0.05 : mini d'après Ismaël
//             "vitessevent": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
//             "temperature": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
//             "linktrouble": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
//         };
//     }

    meteoUpdate = {
        "creator": 5105412,
        "directmensuel": [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // on part de 10 sinon ne fonctionne pas quand on clique sur le graphe...
        "diffusmensuel": [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // on part de 10 sinon ne fonctionne pas...
        "solarfraction": [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // 0.05 : mini d'après Ismaël
        "vitessevent": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        "temperature": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        "linktrouble": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    };
    updateMeteoGraphs(numGraph);
// });

$('#characteristicsMeteoModal').on('hidden.bs.modal', function (e) {
    $('#bAddMeteo').val("false"); // par défaut on met false
});

function updateMeteoGraphs(num) {
    var num = num || 0; // le 1er graphe (direct irradiation par défaut)
    //console.log("updateMeteoGraph num: ", num);
    numGraph = num;
    var editpointdisplay = true; // on affiche le point que si on reste sur le même graphe, sinon on ne l'affiche pas car pas au bon endroit
    if (numGraph != oldNumGraph) {
        editpointdisplay = false;
        oldNumGraph = numGraph
    }
    var legendTitle = $('#meteo_lab_directirradiation').text();
    var maxYvalue = 1000;

    if ($("#meteo_graph").length) {
        var data = [];
        if (meteoUpdate == null) {
            for (var i = 1; i < 13; i++)
                data.push([i, 700]);
        }
        else {
            var dataTab = meteoUpdate.directmensuel;// direct par défaut
            meteo_options.yaxis.min = 0.0;
            meteo_options.tooltipOpts.content = "<b>%y </b>";
            if (num == 1) { // diffus
                dataTab = meteoUpdate.diffusmensuel;
                legendTitle = $('#meteo_lab_diffuseirradiation').text();
            }
            else if (num == 2) { // fraction solaire
                meteo_options.tooltipOpts.content = "<b>%y.2 </b>";//NO 903
                dataTab = meteoUpdate.solarfraction;
                legendTitle = $('#div_solarfraction > label').text();
            }
            else if (num == 3) { // vitesse du vent
                meteo_options.tooltipOpts.content = "<b>%y.1 </b>";//NO 903
                dataTab = meteoUpdate.vitessevent;
                legendTitle = findText("Wind speed") + " (m/s)";// pas x10 $('#div_windspeed > label').text();
            }
            else if (num == 4) { // température de l'air
                dataTab = meteoUpdate.temperature;
                legendTitle = $('#div_airtemp > label').text();
                var min = minTab(dataTab);
                if (min > 0.0) // si les temp ne descendent pas en dessous de 0, on met quand même le min à 0
                    min = 0.0;
                meteo_options.yaxis.min = min; // possiblement négatif !
            }
            else if (num == 5) { // trouble de link
                meteo_options.tooltipOpts.content = "<b>%y.1 </b>";//NO 903
                dataTab = meteoUpdate.linktrouble;
                legendTitle = findText("Link trouble");// pas x10 NO 903
            }

            //Calcul valeur moyenne NO 903
            var meanValue = 0;
            for (var i = 0; i < 12; i++) {
                data.push([i + 1, parseFloat(dataTab[i])]);
                meanValue += parseFloat(dataTab[i]);
            }
            meanValue = meanValue / 12;

            if (num == 2)
                maxYvalue = 1.0; // max de la fraction solaire !
            else
                maxYvalue = maxTab(dataTab, dataTab.length);
        }


        meteo_options.yaxis.max = maxYvalue * 1.10;

        var series = [{ id: "Direct irradiation", label: legendTitle, data: data, lines: { lineWidth: 1 }, points: { show: false } }, { id: "Direct irradiation", label: findText("Mean value"), data: [[1, meanValue], [12, meanValue]], lines: { lineWidth: 1 }, points: { show: false } }];

        // On rajoute le point en cours d'édition
        if (editpointdisplay) {
            var editedPoint_data = [];
            editedPoint_data.push([newpointx, newpointy]);
            series.push({ id: "Edit point", /*label: "mask" ,*/data: editedPoint_data, color: "#CC0000", lines: { show: false }, points: { show: true, radius: 4, lineWidth: 2 } });
        }

        plot_editmeteo_graph = $.plot($("#meteo_graph"), series, meteo_options);
        plot_editmeteo_graph.setupGrid();// since the axes don't change, we don't need to call plot.setupGrid()
        plot_editmeteo_graph.draw();
    }

}

function editMeteoGraph_plotclickfunction(event, pos, item) {
    var trace = 0;
    if (trace == 1) console.log("pos ", pos);
    var clickedx = (~~(pos.x + 0.5)); // floor
    var clickedy = pos.y; // quand on a besoin des décimales, on ne veut pas arrondir
    if (trace == 1) {
        console.log("click " + clickedx + " " + clickedy);
        console.log("numGraph: ", numGraph);
    }
    if (numGraph < 2) {
        clickedy = (~~pos.y); // on arrondi que quand on veut des int, cad pour l'irradiation
    }

    newpointx = clickedx;
    newpointy = clickedy;

    changeValueMeteo(clickedx, clickedy);
    updateMeteoGraphs(numGraph);
}

function changeValueMeteo(clickedx, clickedy) {
    if (numGraph == 2) { // pour la fraction solaire
        if (clickedy > 1.0)
            clickedy = 1.0; // pas plus de 1.0 !
        if (clickedy < 0.05)
            clickedy = 0.05;
    }
    if (numGraph != 4) { // pour la temp de l'air
        if (clickedy < 0.0)
            clickedy = 0.0; // on n'a pas de valeur négative pour le reste des graphiques
    }

    var mois = clickedx - 1;
    if (mois <= 0)
        mois = 0;
    else if (mois >= 12)
        mois = 12;

    if (numGraph == 0)
        meteoUpdate.directmensuel[mois] = clickedy;
    else if (numGraph == 1)
        meteoUpdate.diffusmensuel[mois] = clickedy;
    else if (numGraph == 2)
        meteoUpdate.solarfraction[mois] = clickedy;
    else if (numGraph == 3)
        meteoUpdate.vitessevent[mois] = clickedy;
    else if (numGraph == 4)
        meteoUpdate.temperature[mois] = clickedy;
    else if (numGraph == 5)
        meteoUpdate.linktrouble[mois] = clickedy;

    newpointx = clickedx;
    newpointy = clickedy;
}
function validateEditMeteoValue() {
    if ((newpointx != null) && (newpointy != null)) {
        var yvalue = parseFloat($('#editMeteovalue').val());
        if (numGraph < 2)
            yvalue = parseInt($('#editMeteovalue').val());
        changeValueMeteo(newpointx, yvalue);
        updateMeteoGraphs(numGraph);
    }
}

$("#meteo_graph").bind("plotclick", function (event, pos, item) { editMeteoGraph_plotclickfunction(event, pos, item); });
$("#editMeteovalue").on('change', function () {
    validateEditMeteoValue();
});
$("#editMeteovalue").keypress(function (e) { // valider par touche Entrée (et pas uniquement au change)
    var key = e.which;
    if (key == 13)  // the enter key code
        validateEditMeteoValue();
});

// #5026 : partie sur la BDD du consentement ENEDIS

function addPRM() {
    var accessDatabase = moduleVerify("prm_management", 0, true);
    if (accessDatabase.valide) {
        clic_on_button("prm_management", 0, 0, userid);
        // pour debug :
        /*$('#requester_name').val("VPC");
        $('#holder_name').val("Cythelia Energy");
        $('#prm_mail_holder').val("support@archelios.fr");
        $('#prm_name').val("Le Cythelia");
        $('#prm_num').val("50001685840349"); // PRM Cythelia
        checkAllPRMInputs(); // pour debug*/

        // #7986, ajout d'une popup : Service Enedis temporairement indisponible
        /*bootbox.dialog({
            message:findText("This service is temporarily unavailable due to a technical incident currently being resolved by Enedis.")+" "+findText("We invite you to retrieve a load curve directly from the Enedis SGE platform."),
            closeButton:false,
            buttons: {
                success: {
                    label: findText("OK"),
                    className: "btn-primary",
                    callback: function() {
                        
                    }
                }
            }
        });*/


        // #7844, ajout d'une popup avant l'affichage du formulaire
        bootbox.dialog({
            message: findText("Data collection works subject to activation on the associated ENEDIS account. If data collection has not yet been activated, your access request may not be successful. The collection of data only starts when authorization is given, consequently consumption dating before this date is not taken into account."),
            closeButton: false,
            buttons: {
                success: {
                    label: findText("Got it"),
                    className: "btn-primary",
                    callback: function () {
                        $("#PRMConsentModal").modal('show');
                    }
                }/*,
                cancel: {
                    label: findText("Cancel"),
                    className: "",
                    callback: function() {
                        window.location.href="./Archelios-OnlineEnglish.php#./ajax/projectsList.php";
                    }
                }*/
            }
        });

    }
}

function checkAllPRMInputs() {
    // on utilise un timeout ici, sinon l'utilisateur n'a pas tapé 2 lettres que ça vérifie, prend un temps fou et que ça s'arrête de noter à l'écran

    $('#btn_validate_prm_address').prop("disabled", true); // on grise 

    // on contrôle les entrées si valides
    var allValid = true;
    // test nom : au moins deux caractères ?
    if ($('#requester_name').val().length < 2) {
        $('#requester_name').css("border-color", "#bb2124");
        allValid = false;
    }
    else
        $('#requester_name').css("border-color", "#22bb33");

    // test email
    var $eltPRMEmail = $('#prm_mail_holder');
    if (checkIfValidEmail($eltPRMEmail.val())) {
        //background-color: #ddffdd;
        //$("#age,#phone").css();
        $eltPRMEmail.css("border-color", "#22bb33"); // background-color 4BB543
    } else {
        $eltPRMEmail.css("border-color", "#bb2124");
        allValid = false;
        //$eltPRMEmail.css('color', 'red');
    }

    // test nom : au moins deux caractères ?
    if ($('#prm_name').val().length < 2) {
        $('#prm_name').css("border-color", "#bb2124");
        allValid = false;
    }
    else
        $('#prm_name').css("border-color", "#22bb33");


    // test PRM : 14 chiffres !
    var $eltPRMNum = $('#prm_num');
    var prm_num = $eltPRMNum.val();
    var bPRMNumValid = prm_num.match(/^[0-9]{14}$/); // 14 chiffres uniquement
    if (bPRMNumValid) {
        //background-color: #ddffdd;
        //$("#age,#phone").css();
        $eltPRMNum.css("border-color", "#22bb33"); // background-color 4BB543
        $('#btn_get_prm_address').prop("disabled", false); // on dégrise pour que l'utilisateur revérifie bien l'adresse
    } else {
        $eltPRMNum.css("border-color", "#bb2124");
        $('#btn_get_prm_address').prop("disabled", true); // on grise
        //$eltPRMEmail.css('color', 'red');
        allValid = false;
    }

    $('#prm_address').text(""); // on vide pour réinitialiser
    //console.log("allValid = ", allValid);
    $('#btn_validate_prm_address').prop("disabled", true); // on grise le bouton valider à chaque changement, on ne le dégrise que quand réponse d'Enedis
    $('#div_status_prm').hide(); // on cache les lignes de l'état (statut) du PRM tant qu'on ne les a pas (pas avant vérifier l'adresse)

    //if (bPRMNumValid){
    //findAndDisplayPRMAddress(prm_num); ! pas ici car prend trop de temps, on fait un bouton à part pour vérifier l'adresse et aller la requêter chez Enedis
    //validatePRMaddress(); // pour debug en local
    //}

    disabledCheckAndValidatePRMRequest(true);

    if (allValid) {
        $('#btn_get_prm_address').prop("disabled", false);
    }
    else {
        $('#btn_get_prm_address').prop("disabled", true);
    }
}

function resetPRMaddress() {
    $('#btn_validate_prm_address').prop("disabled", true); // on grise
    $('#prm_address').text("");
}

function getPRMaddress() {
    var $eltPRMNum = $('#prm_num');
    var prm_num = $eltPRMNum.val();
    var bPRMNumValid = prm_num.match(/^[0-9]{14}$/); // 14 chiffres uniquement
    if (bPRMNumValid) {
        findAndDisplayPRMAddress(prm_num);
    }
    else {
        $('#btn_validate_prm_address').prop("disabled", true); // on grise
    }
}

// on cherche l'adresse du PRM (appel sans autorisation possible) pour que l'utilisateur vérifie que c'est bien le bon PRM entré
function findAndDisplayPRMAddress(prm_num) {
    // #7667 on profite de la tâche pour appel GS => #7673
    var urlAPIGS = "./ajax/callapienedisviagateway.php";
    var datasend = 'functionName=ConsultationsDonneesTechniquesContractuelles&prm_num=' + prm_num;
    $.ajax({
        type: "POST",
        url: urlAPIGS,
        data: datasend,
        success: function (json) {
            //console.log("success call GS : ", json);

            // exemple json = '{"status":200,"data":{"address":{"numeroEtNomVoie":"PARC ECO NORMANDIE","codePostal":"76430","commune":{"libelle":"ST ROMAIN DE COLBOSC","code":"76647"}},"terminated":false,"communicating":false},"times":{"values":{"controller":1706189183.41736,"end":1706189184.922021}},"error":[]}';
            var responseGS = JSON.parse(json);
            if (responseGS && typeof responseGS === "object" && responseGS.hasOwnProperty("data")) {

                if (responseGS.status == 200) {// pas d'erreur, on lit l'adresse et l'état du compteur
                    let addressroad = responseGS.data.address.numeroEtNomVoie
                    let postalCode = responseGS.data.address.codePostal;
                    //console.log(postalCode);
                    let libelleCommune = responseGS.data.address.commune.libelle;

                    $('#prm_address').text(addressroad + " " + postalCode + " " + libelleCommune);

                    // #7673 Appel API Enedis via Green Systèmes pour récupérer l'état d'un compteur (résilié, communiquant ou pas)
                    // états du compteur
                    let bServiceMeter = !responseGS.data.terminated; // en service == non terminé/résilié
                    let bCommunicatingMeter = responseGS.data.communicating;
                    let iconeOK = '<i class="fa fa-check-square-o text-success"></i>';
                    let iconeKO = '<i class="glyphicon glyphicon-remove-sign text-danger"></i>';

                    if (bServiceMeter) {
                        $('#prm_service').html(iconeOK);
                    }
                    else {
                        $('#prm_service').html(iconeKO);
                    }
                    if (bCommunicatingMeter) {
                        $('#prm_communicating').html(iconeOK);
                    }
                    else {
                        $('#prm_communicating').html(iconeKO);
                    }
                    $('#div_status_prm').show();

                    if (bServiceMeter && bCommunicatingMeter) // si le compteur est communiquant ET en service, on peut faire la suite, sinon inutile de faire une demande
                        $('#btn_validate_prm_address').prop("disabled", false); // tout est valide, on dégrise le bouton pour valide l'adresse du PRM
                }
                else { // détecter si erreur
                    $('#div_status_prm').hide();
                    var errorMsg = findText("Error"); // erreur générale, si jamais on n'a pas plus d'info ...
                    //responseGS.status == 500

                    if (responseGS.data.hasOwnProperty("msg"))
                        errorMsg = responseGS.data.msg;

                    $('#prm_address').text(errorMsg);
                }
            }
        },
        error: function () {
            console.log("error call GS");
        }
    });

    // AVANT avec appel direct à Enedis :
    //documentation : https://data.enedis.fr/api/v2/console
    // dispo qu'en PROD car certificat d'identification !
    /*var urlAPIENEDISOpenData = "./ajax/callbackapienedis.php"//"https://www.archelios.com/bootstrap/binVPC/ajax/callbackapienedis.php";
    var datasend = 'functionName=ConsultationsDonneesTechniquesContractuelles&prm_num='+prm_num;
    //console.log(datasend);
    $.ajaxSetup({async: false});
    $.ajax({
        type: "POST",
        url: urlAPIENEDISOpenData,
        data: datasend,
        success: function (xml) {
            //console.log("success add PRM: \n", xml);
            if (xml != ""){
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xml,"text/xml");

                // détecter si <faultcode> !
                var error = xmlDoc.getElementsByTagName("faultcode");
                if (typeof error != "undefined" && error.length > 0)
                {
                    var errorMsg = xmlDoc.getElementsByTagName("faultstring")[0].childNodes[0].nodeValue; // message lisible envoyé par Enedis
                    $('#prm_address').text(errorMsg);
                }
                else{ // pas d'erreur
                    var postalCode = xmlDoc.getElementsByTagName("codePostal")[0].childNodes[0].nodeValue;
                    //console.log(postalCode);

                    var commune = xmlDoc.getElementsByTagName('commune')[0].getElementsByTagName('libelle'); // un seul tag commune et on cherche le libellé ensuite (qui lui existe plusieurs fois)
                    var libelleCommune = commune[0].textContent;

                    $('#prm_address').text(postalCode + " "+ libelleCommune);
                    $('#btn_validate_prm_address').prop("disabled", false); // tout est valide, on dégrise le bouton pour valide l'adresse du PRM
                }
            }
        }
    });*/
}

function validatePRMaddress() {
    disabledCheckAndValidatePRMRequest(false);
}

function validatePRMRequest() {
    // on teste avant un ajout que le client a bien coché la case responsabilitante pour lui
    var requester_validity_check = $('#requester_validity_check').is(":checked");
    if (!requester_validity_check)
        alert(findText("Remember to check the box for the validity of the data entered"));
    else {
        var requester_name = $('#requester_name').val();
        var prm_num = $('#prm_num').val();
        var prm_name = purgeAllSpecialCharactersInString($('#prm_name').val(), true); // #7681 : on "purge" comme pour un renommage comme ça évite directement tous les caractères spéciaux
        if (prm_name == "") {
            // si après purge il ne reste plus rien, on met un num par défaut qui est le placeholder de l'input 
            prm_name = findText("PRM name");
        }

        var mail = $('#prm_mail_holder').val();
        var prm_history_index = $('#prm_history_index').is(":checked"); // pour renvoyer un booléen
        var prm_history_load_curve = $('#prm_history_load_curve').is(":checked");
        var prm_subscription_load_curve = $('#prm_subscription_load_curve').is(":checked");
        var prm_subscription_index = $('#prm_subscription_index').is(":checked");
        var prm_technical_data = $('#prm_technical_data').is(":checked");

        var datasend = 'actionBDD=addPRM&requester_name=' + requester_name + '&prm_num=' + prm_num + '&mail=' + mail + '&prm_name=' + prm_name + '&requester_validity_check=' + requester_validity_check + '&prm_history_index=' + prm_history_index + '&prm_history_load_curve=' + prm_history_load_curve + '&prm_subscription_load_curve=' + prm_subscription_load_curve + '&prm_subscription_index=' + prm_subscription_index + '&prm_technical_data=' + prm_technical_data;
        //console.log(datasend);
        $.ajaxSetup({ async: false });
        $.ajax({
            type: "POST",
            url: './ajax/requetes.php5',
            data: datasend,
            success: function (msg) {
                //console.log("success add PRM: ", msg);
                alert(msg);
                $("#PRMConsentModal").modal('hide');
                updatePRMList();
            }
        });
    }
}

function disabledCheckAndValidatePRMRequest(bDisabled) {
    // tout sauf prm_history_load_curve : on laisse coché sinon on ne peut rien faire , #prm_history_load_curve
    $("#PRMConsentModal").find('#prm_history_index, #prm_subscription_load_curve, #prm_subscription_index, #prm_technical_data, #btn_validate_prm_request').prop("disabled", bDisabled);
    if (bDisabled)
        $("#authorizations_prm").hide();
    else
        $("#authorizations_prm").show();
}

function ConnectToApi3E(inputKeyApi, fLatitude, fLongitude, boxApi3E) {
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: { inputKey3E: inputKeyApi, lat: fLatitude, longitude: fLongitude },
        dataType: "text",
        async: true,
        success: function (data) {
            fileImportTMYChanged(null, EProvider.TMY_3E, null, data);
            boxApi3E.modal('hide');
            $('.btn3E').attr("disabled", false);
        }, error: function (data) {
            $('#loadingApi3E').hide();
            $('#waitingMsgAPi3E').hide();
            if (data.status == 500 && data.statusText == "Internal Server Error") {
                $('#msgAPi3EError')[0].innerHTML = findText("msgErrorApi3E").replace("XXX", data.status);
            }
            else if (data.status == 500) {
                $('#msgAPi3EError')[0].innerHTML = findText("msgErrorApi3EInvalidKey").replace("XXX", data.status);
            }
            else if (data.status == 403 && data.statusText == "Forbidden") {
                $('#msgAPi3EError')[0].innerHTML = findText("msgErrorApi3EInvalidKey").replace("XXX", data.status);
            }
            else {
                $('#msgAPi3EError')[0].innerHTML = findText("msgErrorApi3E").replace("XXX", data.statusText);
            }
            $('#msgAPi3EError').show();
            $('.btn3E').attr("disabled", false);
            console.log(data);
        }
    });
}
function ConnectToApiSolargis(inputKeyApi, fLatitude, fLongitude, boxApiSolargis, fprojectName) {//#7606 
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: { inputKeySolargis: inputKeyApi, lat: fLatitude, longitude: fLongitude, projectName: fprojectName },
        dataType: "text",
        async: true,
        success: function (data) {
            data = data.split("\"");
            data = data[3];
            ConnectToApiSolargisSecondCall(data, inputKeyApi, boxApiSolargis);
            $('.boxApiSolargis').attr("disabled", false);
        }, error: function (data) {
            $('#loadingApiSolargis').hide();
            $('#waitingMsgAPiSolargis').hide();
            if (data.status == 412) {
                $('#msgAPiSolargisError')[0].innerHTML = findText("msgErrorApiSolargisInvalidKey").replace("XXX", data.status);
            }
            $('#msgAPiSolargisError').show();
            $('.btnSolargis').attr("disabled", false);
            console.log(data);
        }
    });
}
function ConnectToApiSolargisSecondCall(data, inputKeyApi, boxApiSolargis) {//#7606 
    var name = null;
    $.ajax({
        type: "POST",
        url: './ajax/requetes.php5',
        data: { dataSolargis: data, inputKeySolargis1: inputKeyApi },
        dataType: "text",
        async: true,
        success: function (url) {
            const requestOptions = {
                method: "GET",
                redirect: "follow"
            };
            fetch(url, requestOptions)
                .then((res) => {
                    return res.arrayBuffer();
                })
                .then(JSZip.loadAsync)
                .then((zip) => {
                    name = _.values(zip.files)[0].name;
                    return zip.file(_.values(zip.files)[0].name).async("string");
                })
                .then((zip) => {
                    var Scontents = zip;
                    eProvider = "TMY_Solargis";
                    var oParams = defineParam(eProvider, Scontents);
                    var varParseTmyFile = parseTMYFile(Scontents, oParams, eProvider); //#6467
                    var typicalyear = varParseTmyFile.typicalYear;
                    boxApiSolargis.modal('hide');
                    return updateMeteoStationFormData1(varParseTmyFile, eProvider, name, typicalyear);//#6467
                })
                .catch((data) => {
                    console.log(data);
                })
        }, error: function (data1) {
            if (data1.status == 412) {//l'api a besoin d'un cerains temps avant de sortie les données donc on boucle sur la fonction 
                setTimeout(
                    function () {
                        ConnectToApiSolargisSecondCall(data, inputKeyApi, boxApiSolargis);
                    }
                    , 5000);
            }
        }
    });
}

// #7374 permet de créer directement les options sous le select de choix des références (quand c'est classique : Ref, fab, creator) avec le résultat json d'une requête php
// AVEC gestion des favoris et bon ordre
// type : "modules" / "onduleurs" / ... tous les autres types existant de gFavoritesList
// json : résultat requête php pour la liste de fabricant 
// valManufacturer : id du fabricant sélectionné
// uidToSelect : si rempli c'est avec l'uid d'une référence qu'on doit sélectionnée (par exemple à l'édition d'un champ PV, on reprend la ref sélectionnée précédemment)
// bFillNoResult : true pour remplir automatiquement qu'il n'y a pas de références avec le fabricant sélectionné
function fillOptionsForSelectReference(type, json, valManufacturer, uidToSelect, bFillNoResult) {
    if (typeof uidToSelect == "undefined")
        uidToSelect = "";
    if (typeof bFillNoResult == "undefined")
        bFillNoResult = true;

    // #7374 on cherche si le fabricant est dans les favoris :
    var resManufacturerAndReferences = searchIfManufacturerInFavoritesListAndNumberOfReferences(gFavoritesList, type, valManufacturer);
    var positionOfSearchedManufacturer = resManufacturerAndReferences.positionOfSearchedManufacturer;
    var orderMaxFavorite = resManufacturerAndReferences.nbReferences + 1; // ordre max des références de favoris, le reste sera mis après, c'est pourquoi on met +1

    var firstvalue = -1;
    var arrayOfOptionsWithOrder = []; // pour pouvoir trier ensuite en fonction d'un ordre
    var countOrder = 0; // pour être sûr de garder le même ordre
    $.each(json, function (index, value) {
        // #7374 on met l'info favori au tout début :
        let favoriteEquipment = '';
        var order = orderMaxFavorite + countOrder;
        countOrder++;
        if (positionOfSearchedManufacturer > -1) { // le fabricant est dans les favoris
            // on recherche si la ref est dans les favoris
            var posInList = gFavoritesList[type][positionOfSearchedManufacturer].referencesList.indexOf(index); // position dans la liste des favoris
            if (posInList > -1) {
                favoriteEquipment = '&#9733; '; // Encodage Html Entité pour une étoile
                order = posInList;
            }
        }

        let equipmentUser = ''; //#534: par défaut ce n'est pas du matériel utilisateur
        if (value.creator != "1")
            equipmentUser = '* '; //#534 pour signifier visuellement que le matériel est celui de l'utilisateur

        txtBifacial = ''; // uniquement pour les modules
        if (type == "modules") {
            // #4103 Mettre [bifacial] dans le nom du module au moment de la recherche si le module est bifacial -> facilite la recherche
            if (value.bifacial == "1")
                txtBifacial = ' [bifacial]';
        }

        if (uidToSelect == index) // NO 926 -> on ne value pas automatiquement (on vérifie toujours la correspondance avant)
            firstvalue = index;

        var txtoption = '<option value="' + index + '">' + favoriteEquipment + equipmentUser + value.name + txtBifacial + '</option>';

        arrayOfOptionsWithOrder.push({
            order: order,
            txtoption: txtoption,
            index: index
        });

    });

    if (arrayOfOptionsWithOrder.length == 0 && bFillNoResult) {
        return {
            "contentSelectReordered": '<option value="-1">' + txt_noresult + '</option>',
            "firstvalueIndex": "-1"
        };
    }

    // on tri par ordre pour mettre les favoris en 1er
    let resReorder = reorderContentSelectWithOrder(arrayOfOptionsWithOrder);

    if (firstvalue == -1)
        firstvalue = resReorder.firstvalueIndex; // on sélectionne le 1er de la liste donc le favori (si favori il y a)

    return {
        "contentSelectReordered": resReorder.contentSelectReordered,
        "firstvalueIndex": firstvalue
    };

}

function getIdManufacturerAndUIDReferenceSelectedByType(type) {
    var idManufacturer = -1, uidEquipment = null;

    switch (type) {
        case "modules":
            idManufacturer = $('#manufacturer_module').val();
            uidEquipment = $('#module').val();
            break;
        case "inverters":
            idManufacturer = $('#manufacturer_inverter').val();
            uidEquipment = $('#userchoice_inverter').val();
            break;
        case "optimizers":
            idManufacturer = $('#manufacturer_optimizer').val();
            uidEquipment = $('#optimizer').val();
            break;
        case "batteries":
            idManufacturer = $('#manufacturer_battery').val();
            uidEquipment = $('#battery').val();
            break;
        default:
            break;
    }

    return {
        "selectedIDManufacturer": idManufacturer,
        "selectedUIDReference": uidEquipment
    };
}

// #7374 Mettre en place un système de favoris pour le matériel
function addEquipmentToFavoritesList(type) {
    clic_on_button("add_favorites_list_" + type, 0, 0, userid);

    if (!gFavoritesList.hasOwnProperty(type)) {
        gFavoritesList[type] = [];
    }

    var resIdManufacturerAndUIDReferenceSelected = getIdManufacturerAndUIDReferenceSelectedByType(type);
    var idManufacturer = resIdManufacturerAndUIDReferenceSelected.selectedIDManufacturer;
    var uidEquipment = resIdManufacturerAndUIDReferenceSelected.selectedUIDReference;

    if (idManufacturer != 1 && uidEquipment != null) {
        gFavoritesList[type] = addEquipmentToFavoritesListWithDatas(gFavoritesList[type], idManufacturer, uidEquipment);

        // pour mettre à jour les bonnes listes :
        updateSelectManufacturerListByType(type, true);
        updateSelectReferenceListByType(type, uidEquipment);

        // on sauve le fichier modifié :
        saveUserFile("preferences.json", "favoritesList", gFavoritesList);
    }
    else {
        alert(findText("Unable to add material to favorites. Please check the manufacturer and reference."));
    }
}

function addEquipmentToFavoritesListWithDatas(favoritesListByType, idManufacturer, uidEquipment) {
    // test si fab existe déjà 
    var positionOfSearchedManufacturer = checkExistAndValidKeyInArrayOfObject(favoritesListByType, "idManufacturer", idManufacturer);
    if (positionOfSearchedManufacturer == -1) { // le fabricant n'existe pas
        favoritesListByType.push({
            "idManufacturer": idManufacturer,
            "referencesList": [uidEquipment]
        });
    }
    else {
        // on teste si la ref existe déjà ou pas dans les favoris
        if (favoritesListByType[positionOfSearchedManufacturer].referencesList.indexOf(uidEquipment) == -1) // pas trouvé, on ajoute
            favoritesListByType[positionOfSearchedManufacturer].referencesList.push(uidEquipment);
    }

    return favoritesListByType;
}

function deleteEquipmentToFavoritesList(type) {
    clic_on_button("delete_favorites_list_" + type, 0, 0, userid);

    if (!gFavoritesList.hasOwnProperty(type)) {
        return;
    }

    var resIdManufacturerAndUIDReferenceSelected = getIdManufacturerAndUIDReferenceSelectedByType(type);
    var idManufacturer = resIdManufacturerAndUIDReferenceSelected.selectedIDManufacturer;
    var uidEquipment = resIdManufacturerAndUIDReferenceSelected.selectedUIDReference;

    if (idManufacturer != 1 && uidEquipment != null) {
        var positionOfSearchedManufacturer = checkExistAndValidKeyInArrayOfObject(gFavoritesList[type], "idManufacturer", idManufacturer);
        if (positionOfSearchedManufacturer > -1) { // le fabricant existe (sinon on ne fait rien)

            let posRef = gFavoritesList[type][positionOfSearchedManufacturer].referencesList.indexOf(uidEquipment);
            if (posRef > -1) {
                gFavoritesList[type][positionOfSearchedManufacturer].referencesList.splice(posRef, 1); // 2nd parameter means remove one item only
            }

            // si la référence était la seule du fabricant, on enlève aussi le fabricant des favoris
            if (gFavoritesList[type][positionOfSearchedManufacturer].referencesList.length == 0) {
                gFavoritesList[type].splice(positionOfSearchedManufacturer, 1);
                // pour mettre à jour la bonne liste :
                updateSelectManufacturerListByType(type, false);
            }

            // pour mettre à jour la bonne liste :
            updateSelectReferenceListByType(type, uidEquipment);

            // on sauve le fichier modifié :
            saveUserFile("preferences.json", "favoritesList", gFavoritesList);
        }
    }
    else {
        alert(findText("Unable to delete material to favorites. Please check the manufacturer and reference."));
    }
}

// pour mettre à jour le texte de l'option du fabricant (avec ou sans étoile de favoris)
function updateSelectManufacturerListByType(type, bIsFavorite) {
    var jSelect = null;
    switch (type) {
        case "modules":
            jSelect = $('#manufacturer_module');
            var idSelectedManufacturer = jSelect.val();
            jSelect.empty().trigger('change'); // pour bien regénérer le select et que l'ordre + changement html soit bien pris en compte !
            updateModuleManufacturers(idSelectedManufacturer);
            break;
        case "inverters":
            jSelect = $('#manufacturer_inverter');
            var idSelectedManufacturer = jSelect.val();
            jSelect.empty().trigger('change'); // pour bien regénérer le select et que l'ordre + changement html soit bien pris en compte !
            updateInverterManufacturers(idSelectedManufacturer);
            break;
        case "optimizers":
            jSelect = $('#manufacturer_optimizer');
            var idSelectedManufacturer = jSelect.val();
            jSelect.empty().trigger('change'); // pour bien regénérer le select et que l'ordre + changement html soit bien pris en compte !
            updateOptimizerManufacturers(idSelectedManufacturer);
            break;
        case "batteries":
            jSelect = $('#manufacturer_battery');
            var idSelectedManufacturer = jSelect.val();
            jSelect.empty().trigger('change'); // pour bien regénérer le select et que l'ordre + changement html soit bien pris en compte !
            updateBatteryManufacturers(idSelectedManufacturer);
            break;
        default:
            break;
    }
}

// pour mettre à jour la liste de références (avec ou sans étoile de favoris par exemple)
function updateSelectReferenceListByType(type, uidEquipment) {
    switch (type) {
        case "modules":
            updateModulesList(uidEquipment); // pour mettre à jour la liste
            break;
        case "inverters":
            updateInvertersListManual(uidEquipment);
            break;
        case "optimizers":
            updateOptimizersList(uidEquipment);
            break;
        case "batteries":
            updateBatteriesList(uidEquipment);
            break;
        default:
            break;
    }
}
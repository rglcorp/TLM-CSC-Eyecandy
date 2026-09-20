// Input: MODEL, MODEL_NAME, LORES, LORE_COLOR, getStaNameFunc, getTransformLoreFunc

const models = ModelManager.loadPartedRawModel(Resources.manager(), Resources.idr(MODEL), null);
const DETECT_RADIUS = 3;

const rawModels = {
    "head": new RawModel(),
    "body": new RawModel(),
    "blink": new RawModel(),
    "sin": new RawModel(),
    "cos": new RawModel(),
}

for(let entry of models.entrySet()) {
    let modelKey = entry.getKey();
    let model = entry.getValue();
    model.applyUVMirror(false, true);
    
    if(modelKey.startsWith("head") || modelKey.startsWith("hat") || modelKey.startsWith("hair") || modelKey.startsWith("horn")) {
        rawModels["head"].append(model);
    } else if(modelKey.startsWith("blink")) {
        rawModels["blink"].append(model);
    } else if(modelKey.startsWith("sin")) {
        rawModels["sin"].append(model);
    } else if(modelKey.startsWith("cos")) {
        rawModels["cos"].append(model);
    } else {
        rawModels["body"].append(model);
    }
}

const uploadedModels = {
    "head": ModelManager.uploadVertArrays(rawModels["head"]),
    "body": ModelManager.uploadVertArrays(rawModels["body"]),
    "sin": ModelManager.uploadVertArrays(rawModels["sin"]),
    "cos": ModelManager.uploadVertArrays(rawModels["cos"]),
    "blink": ModelManager.uploadVertArrays(rawModels["blink"])
}

function create(ctx, state, eyecandy) {
    state.wiggleTimer = 0;
    state.old_in_range = false;
    state.welcome_msg_timer = 0;
}

const ANIM_DURATION = 6.15;
const toStaNameFunc = getStaNameFunc();
const transformLoreFunc = getTransformLoreFunc() == null ? (e) => e : getTransformLoreFunc();

function render(ctx, state, eyecandy) {
    let inRange = MinecraftClient.localPlayer().pos().distance(eyecandy.pos()) < DETECT_RADIUS;
    // if(state.wiggleTimer > 0 || inRange) {
        state.wiggleTimer += (Timing.delta()*2);
    // }
    state.welcome_msg_timer -= Timing.delta();
    
    if(state.wiggleTimer > ANIM_DURATION) {
        state.wiggleTimer = 0;
    }
    
    let headMat = new Matrices();
    headMat.translate(0, -1, 0);
    headMat.rotateZDegrees(Math.sin(state.wiggleTimer)*1.5);
    
    let bodyMat = new Matrices();
    bodyMat.translate(0, -1, 0);
    bodyMat.rotateZDegrees(Math.sin(state.wiggleTimer)*1);
    
    ctx.drawModel(uploadedModels["head"], headMat);
    ctx.drawModel(uploadedModels["body"], bodyMat);
    
    let sinMat = new Matrices();
    sinMat.translate(0, -0.8 + Math.sin(Timing.elapsed()*2)*0.15, 0);
    ctx.drawModel(uploadedModels["sin"], sinMat);
    
    let cosMat = new Matrices();
    cosMat.translate(0, -0.8 + Math.cos(Timing.elapsed()*2)*0.15, 0);
    ctx.drawModel(uploadedModels["cos"], cosMat);
    
    if(state.wiggleTimer >= ANIM_DURATION-0.4) { // Blink in last 0.4s
        ctx.drawModel(uploadedModels["blink"], headMat);
    }
    
    if(!state.old_in_range && inRange) {
        let sameYLevel = MinecraftClient.localPlayer().blockPos().y() == eyecandy.blockPos().y()-1;
        
        if(state.welcome_msg_timer < 0 && sameYLevel) {
            let stationName = "<No Man's Land>";
            let sta = org.mtr.mod.InitClient.findStation(eyecandy.blockPos().rawBlockPos());
            if(sta != null) {
                stationName = sta.getName();
            }
            MinecraftClient.displayMessage(VanillaText.literal("===== Customer Service Centre =====").withColor(0x0088EE), false);
            // TODO: Customizable base lore?
            MinecraftClient.displayMessage(VanillaText.literal(`> ${transformLoreFunc(`Hiya! Welcome to ${toStaNameFunc(stationName)} station!`)}`).withColor(LORE_COLOR).withItalic(), false);
            
            if(LORES != null) {
                for(let lore of LORES) {
                    MinecraftClient.displayMessage(VanillaText.literal(`> ${transformLoreFunc(lore)}`).withColor(LORE_COLOR).withItalic(), false);
                }
            } else {
                MinecraftClient.displayMessage(VanillaText.literal("> Customer service? What Customer Service?").withColor(LORE_COLOR).withItalic(), false);
                MinecraftClient.displayMessage(VanillaText.literal("> I am the very concept of Customer Service!").withColor(LORE_COLOR).withItalic(), false);
            }
        }
        state.welcome_msg_timer = 3;
    }
    state.old_in_range = inRange;
    
    /* On use event */
    if(ctx.events().onBlockUse.occurred()) {
        MinecraftClient.displayMessage(VanillaText.literal("TLM-CSC-Eyecandy").withColor("GRAY"), false);
        MinecraftClient.displayMessage(VanillaText.literal("github.com/rglcorp/TLM-CSC-Eyecandy [Click to visit]").withHoverText("github.com/rglcorp/TLM-CSC-Eyecandy").clickToOpenURL("https://github.com/rglcorp/TLM-CSC-Eyecandy").withColor("GRAY").withItalic(), false);
        MinecraftClient.displayMessage("", false);
        MinecraftClient.displayMessage(VanillaText.literal(`Character: ${MODEL_NAME}`).withColor("GRAY"), false);
        MinecraftClient.displayMessage(VanillaText.literal("Model and assets from TouhouLittleMaid").withColor("GRAY"), false);
        MinecraftClient.displayMessage(VanillaText.literal("CC-BY-NC-SA 4.0").withColor("GRAY"), false);
    }
    ctx.events().handled();
}
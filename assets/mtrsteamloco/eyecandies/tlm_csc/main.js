// Input: MODEL, MODEL_NAME, LORES, LORE_COLOR, getStaNameFunc, getTransformLoreFunc

if(typeof IS_MTR4 === 'undefined') {
    IS_MTR4 = Resources.getMTRVersion().startsWith("4");
}

if(typeof SHUTUP === 'undefined') {
    SHUTUP = false;
}

SHUTUP = SHUTUP || !IS_MTR4;

const DETECT_RADIUS = 3;
const ANIM_DURATION = 6.15;

const toStaNameFunc = getStaNameFunc();
const translationFunc = getTransformLoreFunc() == null ? (e) => e : getTransformLoreFunc();

const models = ModelManager.loadPartedRawModel(Resources.manager(), Resources.idr(MODEL), null);

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
    state.greeted = false;
    state.greeting_cooldown = 0;
}

function render(ctx, state, eyecandy) {
    state.wiggleTimer += (Timing.delta()*2);
    state.greeting_cooldown -= Timing.delta();
    
    if(state.wiggleTimer > ANIM_DURATION) {
        state.wiggleTimer = 0;
    }
    
    let headMat = new Matrices();
    headMat.translate(0, -1, 0);

    headMat.rotate(0, 0, 1, java.lang.Math.toRadians(Math.sin(state.wiggleTimer)*1.5));
    
    let bodyMat = new Matrices();
    bodyMat.translate(0, -1, 0);
    bodyMat.rotate(0, 0, 1, java.lang.Math.toRadians(Math.sin(state.wiggleTimer)*1));
    
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
    
    // Begin convo
    if(!SHUTUP) {
        let playerYaw = wrapAngleDeg(MinecraftClient.localPlayer().yaw() + 180);
        let eyecandyYaw = eyecandy.facing().asRotation(); // TODO: Change to facingAngle() once v2.3 is out
        let isFacing = Math.abs(playerYaw - eyecandyYaw) < 20;
        let inRange = MinecraftClient.localPlayer().pos().distance(eyecandy.pos()) < DETECT_RADIUS;
        let inRangeAndFacing = inRange && isFacing;
        
        if(!state.greeted && inRangeAndFacing) {
            let sameYLevel = MinecraftClient.localPlayer().blockPos().y() == eyecandy.blockPos().y()-1;
            
            if(state.greeting_cooldown < 0 && sameYLevel) {
                let stationName = "<No Man's Land>";
                let sta = org.mtr.mod.InitClient.findStation(eyecandy.blockPos().rawBlockPos());
                if(sta != null) {
                    stationName = sta.getName();
                }
                let displayedStationName = toStaNameFunc(stationName);
                
                MinecraftClient.displayMessage(VanillaText.literal("===== Customer Service Centre =====").withColor(0x0088EE), false);
                // TODO: Customizable base lore?
                MinecraftClient.displayMessage(VanillaText.literal(`> ${translationFunc(`Hiya! Welcome to ${displayedStationName} station!`)}`).withColor(LORE_COLOR).withItalic(), false);
                
                if(LORES != null) {
                    for(let lore of LORES) {
                        MinecraftClient.displayMessage(VanillaText.literal(`> ${translationFunc(lore.replace("{STA}", displayedStationName))}`).withColor(LORE_COLOR).withItalic(), false);
                    }
                } else {
                    MinecraftClient.displayMessage(VanillaText.literal("> Customer service? What Customer Service?").withColor(LORE_COLOR).withItalic(), false);
                    MinecraftClient.displayMessage(VanillaText.literal("> I am the very definition of Customer Service!").withColor(LORE_COLOR).withItalic(), false);
                }
            }
            state.greeting_cooldown = 3;
            
            state.greeted = true;
        }
        
        if(state.greeted && !inRange) {
            state.greeted = false;
        }
    }
    
    /* On use event */
    if(IS_MTR4) {
        if(ctx.events().onBlockUse.occurred()) credit()
            ctx.events().handled();
    }
}

function credit() {
    MinecraftClient.displayMessage(VanillaText.literal("TLM-CSC-Eyecandy").withColor("GRAY"), false);
    MinecraftClient.displayMessage(VanillaText.literal("github.com/rglcorp/TLM-CSC-Eyecandy [Click to visit]").withHoverText("github.com/rglcorp/TLM-CSC-Eyecandy").clickToOpenURL("https://github.com/rglcorp/TLM-CSC-Eyecandy").withColor("GRAY").withItalic(), false);
    MinecraftClient.displayMessage("", false);
    MinecraftClient.displayMessage(VanillaText.literal(`Character: ${MODEL_NAME}`).withColor("GRAY"), false);
    MinecraftClient.displayMessage(VanillaText.literal("Model and assets modified from TouhouLittleMaid").withColor("GRAY"), false);
    MinecraftClient.displayMessage(VanillaText.literal("CC-BY-NC-SA 4.0").withColor("GRAY"), false);
}

function wrapAngleDeg(degrees) {
    return (degrees % 360 + 360) % 360;
}
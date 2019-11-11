import Blockly from "./scratch-extend";
// Instantiate scratch-blocks and attach it to the DOM.
const workspace = Blockly.inject('blocks', {
    media:`./media/`,
    zoom: {
        controls: true,
        wheel: true,
        startScale: 0.75
    },
    grid: {
        spacing: 40,
        length: 2,
        colour: '#ddd'
    },
    colours: {
        workspace: '#FFFFFF',
        flyout: '#F9F9F9',
        toolbox: '#FFFFFF',
        toolboxSelected: '#F9F9F9',
        toolboxText: '#696D6F',
        scrollbar: '#DDDDDD',
        scrollbarHover: '#DDDDDD',
        insertionMarker: '#000000',
        insertionMarkerOpacity: 0.2,
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6,
        event: {
            primary: '#E1BA3F',
            secondary: '#E1BA3F',
            tertiary: '#CC9900'
        }
    },
    comments: true,
    collapse: false,
    sounds: false,
    // true表示不允许增加删除积木块
    mode: false,
    // false表示禁止编辑积木块上的input
    editInput: true
});

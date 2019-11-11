import goog from './goog.js';
export default function (Blockly) {
    Blockly.inject = function(container, opt_options) {
        container = document.getElementById(container) ||
                document.querySelector(container);

        var options = new Blockly.Options(opt_options || {});
        var subContainer = goog.dom.createDom('div', 'injectionDiv');
        container.appendChild(subContainer);
        Blockly.Field.startCache();

        var svg = Blockly.createDom_(subContainer, options);
        var blockDragSurface = new Blockly.BlockDragSurfaceSvg(subContainer);
        var workspaceDragSurface = new Blockly.WorkspaceDragSurfaceSvg(subContainer);

        var workspace = Blockly.createMainWorkspace_(svg, options, blockDragSurface,
            workspaceDragSurface);
        Blockly.init_(workspace);
        Blockly.mainWorkspace = workspace;

        Blockly.svgResize(workspace);
        return workspace;
    };

    Blockly.init_ = function(mainWorkspace) {
        var options = mainWorkspace.options;
        var svg = mainWorkspace.getParentSvg();

        // Suppress the browser's context menu.
        Blockly.bindEventWithChecks_(svg.parentNode, 'contextmenu', null,
            function(e) {
                if (!Blockly.utils.isTargetInput(e)) {
                    e.preventDefault();
                }
            });

        var workspaceResizeHandler = Blockly.bindEventWithChecks_(window, 'resize',
            null,
            function() {
                Blockly.hideChaffOnResize(true);
                Blockly.svgResize(mainWorkspace);
            });
        mainWorkspace.setResizeHandlerWrapper(workspaceResizeHandler);

        Blockly.inject.bindDocumentEvents_();

        if (options.languageTree) {
            if (mainWorkspace.toolbox_) {
                console.log(mainWorkspace)
                mainWorkspace.toolbox_.init(mainWorkspace);
            } else if (mainWorkspace.flyout_) {
                // Build a fixed flyout with the root blocks.
                mainWorkspace.flyout_.init(mainWorkspace);
                mainWorkspace.flyout_.show(options.languageTree.childNodes);
                mainWorkspace.flyout_.scrollToStart();
                // Translate the workspace to avoid the fixed flyout.
                if (options.horizontalLayout) {
                    mainWorkspace.scrollY = mainWorkspace.flyout_.height_;
                    if (options.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
                        mainWorkspace.scrollY *= -1;
                    }
                } else {
                    mainWorkspace.scrollX = mainWorkspace.flyout_.width_;
                    if (options.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
                        mainWorkspace.scrollX *= -1;
                    }
                }
                mainWorkspace.translate(mainWorkspace.scrollX, mainWorkspace.scrollY);
            }
        }

        if (options.hasScrollbars) {
            mainWorkspace.scrollbar = new Blockly.ScrollbarPair(mainWorkspace);
            mainWorkspace.scrollbar.resize();
        }

        // Load the sounds.
        if (options.hasSounds) {
            Blockly.inject.loadSounds_(options.pathToMedia, mainWorkspace);
        }
    };

    Blockly.inject.bindDocumentEvents_ = function() {
        if (!Blockly.documentEventsBound_) {
            Blockly.bindEventWithChecks_(document, 'keydown', null, Blockly.onKeyDown_);
            // longStop needs to run to stop the context menu from showing up.  It
            // should run regardless of what other touch event handlers have run.
            Blockly.bindEvent_(document, 'touchend', null, Blockly.longStop_);
            Blockly.bindEvent_(document, 'touchcancel', null, Blockly.longStop_);
        }
        Blockly.documentEventsBound_ = true;
    };

    Blockly.Toolbox.prototype.init = function() {
        var workspace = this.workspace_;
        var svg = this.workspace_.getParentSvg();

        /**
         * HTML container for the Toolbox menu.
         * @type {Element}
         */
        this.HtmlDiv =
            goog.dom.createDom(goog.dom.TagName.DIV, 'blocklyToolboxDiv');
        this.HtmlDiv.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
        svg.parentNode.insertBefore(this.HtmlDiv, svg);

        // Clicking on toolbox closes popups.
        Blockly.bindEventWithChecks_(this.HtmlDiv, 'mousedown', this,
            function(e) {
                // Cancel any gestures in progress.
                this.workspace_.cancelCurrentGesture();
                if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
                    // Close flyout.
                    Blockly.hideChaff(false);
                } else {
                    // Just close popups.
                    Blockly.hideChaff(true);
                }
                Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
            }, /*opt_noCaptureIdentifier*/ false, /*opt_noPreventDefault*/ true);

        this.createFlyout_();
        this.categoryMenu_ = new Blockly.Toolbox.CategoryMenu(this, this.HtmlDiv);
        this.populate_(workspace.options.languageTree);
        this.position();
    };

    Blockly.Toolbox.prototype.createFlyout_ = function() {
        var workspace = this.workspace_;

        var options = {
            disabledPatternId: workspace.options.disabledPatternId,
            parentWorkspace: workspace,
            RTL: workspace.RTL,
            oneBasedIndex: workspace.options.oneBasedIndex,
            horizontalLayout: workspace.horizontalLayout,
            toolboxPosition: workspace.options.toolboxPosition,
            stackGlowFilterId: workspace.options.stackGlowFilterId
        };

        if (workspace.horizontalLayout) {
            this.flyout_ = new Blockly.HorizontalFlyout(options);
        } else {
            this.flyout_ = new Blockly.VerticalFlyout(options);
        }
        this.flyout_.setParentToolbox(this);

        goog.dom.insertSiblingAfter(
            this.flyout_.createDom('svg'), this.workspace_.getParentSvg());
         this.flyout_.init(workspace);
    };

    goog.dom.insertSiblingAfter = function(newNode, refNode) {
        if (refNode.parentNode) {
            refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
        }
    };

    // Blockly.VerticalFlyout = function(workspaceOptions) {
    //     workspaceOptions.getMetrics = this.getMetrics_.bind(this);
    //     workspaceOptions.setMetrics = this.setMetrics_.bind(this);
    //
    //     Blockly.VerticalFlyout.superClass_.constructor.call(this, workspaceOptions);
    //     /**
    //      * Flyout should be laid out vertically.
    //      * @type {boolean}
    //      * @private
    //      */
    //     this.horizontalLayout_ = false;
    //
    //     /**
    //      * List of checkboxes next to variable blocks.
    //      * Each element is an object containing the SVG for the checkbox, a boolean
    //      * for its checked state, and the block the checkbox is associated with.
    //      * @type {!Array.<!Object>}
    //      * @private
    //      */
    //     this.checkboxes_ = [];
    // };
}

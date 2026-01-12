import { CommandToolbarButton } from '@jupyterlab/apputils';
import { ReactWidget, redoIcon, ReactiveToolbar, undoIcon, classes } from '@jupyterlab/ui-components';
import { Widget } from '@lumino/widgets';
import * as React from 'react';
import { DefaultIconRenderer, UsersItem } from '@jupyter/collaboration';
import { CommandIDs } from '../commands';
import { terminalToolbarIcon } from '../tools';
export const TOOLBAR_SEPARATOR_CLASS = 'jcad-Toolbar-Separator';
export class Separator extends Widget {
    /**
     * Construct a new separator widget.
     */
    constructor() {
        super();
        this.addClass(TOOLBAR_SEPARATOR_CLASS);
    }
}
function createUserIconRenderer(model) {
    let selectedUserId;
    return (props) => {
        var _a;
        const { user } = props;
        const isSelected = user.userId === selectedUserId;
        const className = classes((_a = props.className) !== null && _a !== void 0 ? _a : '', isSelected ? 'selected' : '');
        const onClick = () => {
            if (user.userId === selectedUserId) {
                selectedUserId = undefined;
                model.setUserToFollow(undefined);
            }
            else {
                selectedUserId = user.userId;
                model.setUserToFollow(user.userId);
            }
        };
        return (React.createElement(DefaultIconRenderer, { user: user, onClick: onClick, className: className }));
    };
}
/**
 * Create the UsersItem component using the custom follow-mode iconRenderer.
 */
function createUsersItemWithFollow(model) {
    return (React.createElement(UsersItem, { model: model, iconRenderer: createUserIconRenderer(model) }));
}
export class ToolbarWidget extends ReactiveToolbar {
    constructor(options) {
        super();
        this.addClass('jpcad-toolbar-widget');
        setTimeout(() => {
            var _a;
            // Allow the widget tracker to propagate the new widget signal.
            if (options.commands) {
                this.addItem('undo', new CommandToolbarButton({
                    id: CommandIDs.undo,
                    label: '',
                    icon: undoIcon,
                    commands: options.commands
                }));
                this.addItem('redo', new CommandToolbarButton({
                    id: CommandIDs.redo,
                    label: '',
                    icon: redoIcon,
                    commands: options.commands
                }));
                this.addItem('separator1', new Separator());
                // Parts
                this.addItem('New Box', new CommandToolbarButton({
                    id: CommandIDs.newBox,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('New Cylinder', new CommandToolbarButton({
                    id: CommandIDs.newCylinder,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('New Sphere', new CommandToolbarButton({
                    id: CommandIDs.newSphere,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('New Cone', new CommandToolbarButton({
                    id: CommandIDs.newCone,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('New Torus', new CommandToolbarButton({
                    id: CommandIDs.newTorus,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('separator2', new Separator());
                // Operators
                this.addItem('Cut', new CommandToolbarButton({
                    id: CommandIDs.cut,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Union', new CommandToolbarButton({
                    id: CommandIDs.union,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Intersection', new CommandToolbarButton({
                    id: CommandIDs.intersection,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Extrusion', new CommandToolbarButton({
                    id: CommandIDs.extrusion,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('separator3', new Separator());
                this.addItem('Chamfer', new CommandToolbarButton({
                    id: CommandIDs.chamfer,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Fillet', new CommandToolbarButton({
                    id: CommandIDs.fillet,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('separator4', new Separator());
                this.addItem('New Sketch', new CommandToolbarButton({
                    id: CommandIDs.newSketch,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('separator5', new Separator());
                // View helpers
                this.addItem('Exploded View', new CommandToolbarButton({
                    id: CommandIDs.updateExplodedView,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Clip View', new CommandToolbarButton({
                    id: CommandIDs.updateClipView,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Toggle Wireframe', new CommandToolbarButton({
                    id: CommandIDs.wireframe,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Toggle Transform Controls', new CommandToolbarButton({
                    id: CommandIDs.transform,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('separator6', new Separator());
                this.addItem('Axes Helper', new CommandToolbarButton({
                    id: CommandIDs.updateAxes,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('Camera Settings', new CommandToolbarButton({
                    id: CommandIDs.updateCameraSettings,
                    label: '',
                    commands: options.commands
                }));
                this.addItem('separator7', new Separator());
                this.addItem('Toggle console', new CommandToolbarButton({
                    id: CommandIDs.toggleConsole,
                    commands: options.commands,
                    label: '',
                    icon: terminalToolbarIcon
                }));
                this.addItem('separator8', new Separator());
                ((_a = options.externalCommands) !== null && _a !== void 0 ? _a : []).forEach(cmd => {
                    var _a;
                    this.addItem(cmd.name, new CommandToolbarButton({
                        id: cmd.id,
                        label: (_a = cmd.label) !== null && _a !== void 0 ? _a : '',
                        commands: options.commands
                    }));
                });
                this.addItem('spacer', ReactiveToolbar.createSpacerItem());
                // Users
                this.addItem('users', ReactWidget.create(createUsersItemWithFollow(options.model)));
            }
        }, 100);
    }
}

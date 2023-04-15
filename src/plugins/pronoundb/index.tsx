/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./styles.css";

import { addContextMenuPatch, findGroupChildrenByChildId, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import { openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { Menu, React } from "@webpack/common";

import PronounsAboutComponent from "./components/PronounsAboutComponent";
import { CompactPronounsChatComponentWrapper, PronounsChatComponentWrapper } from "./components/PronounsChatComponent";
import PronounsProfileWrapper from "./components/PronounsProfileWrapper";
import SetPronounsModal from "./components/SetPronounsModal";
import { fetchPronouns } from "./pronoundbUtils";

export enum PronounsFormat {
    Lowercase = "LOWERCASE",
    Capitalized = "CAPITALIZED"
}

const seen = new WeakSet();
const userContextMenuPatch: NavContextMenuPatchCallback = (children, props) => {
    if (seen.has(children)) return;
    seen.add(children);

    if (!props) return;
    const group = findGroupChildrenByChildId("user-profile", children);
    if (group && !group.some(child => child?.props?.id === "set-user-pronouns")) {
        group.push((
            <Menu.MenuItem
                label="Set User Pronouns"
                key="set-user-pronouns"
                id="set-user-pronouns"
                action={async () => {
                    const pronouns = await fetchPronouns(props.user.id);
                    openModal(modalProps => <SetPronounsModal {...modalProps} defaultPronouns={pronouns} userId={props.user.id} />);
                }}
            />
        ));
    }
};

export default definePlugin({
    name: "PronounDB",
    authors: [Devs.Tyman, Devs.TheKodeToad],
    description: "Adds pronouns to user messages using pronoundb",
    dependencies: ["ContextMenuAPI"],
    patches: [
        // Add next to username (compact mode)
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                match: /("span",{id:\i,className:\i,children:\i}\))/,
                replace: "$1, $self.CompactPronounsChatComponentWrapper(e)"
            }
        },
        // Patch the chat timestamp element (normal mode)
        {
            find: "showCommunicationDisabledStyles",
            replacement: {
                match: /(?<=return\s*\(0,\i\.jsxs?\)\(.+!\i&&)(\(0,\i.jsxs?\)\(.+?\{.+?\}\))/,
                replace: "[$1, $self.PronounsChatComponentWrapper(e)]"
            }
        },
        // Hijack the discord pronouns section and add a wrapper around the text section
        {
            find: ".Messages.BOT_PROFILE_SLASH_COMMANDS",
            replacement: {
                match: /\(0,.\.jsx\)\((?<PronounComponent>\i\..),(?<pronounProps>{currentPronouns.+?:(?<fullProps>\i)\.pronouns.+?})\)/,
                replace: "$<fullProps>&&$self.PronounsProfileWrapper($<PronounComponent>,$<pronounProps>,$<fullProps>)"
            }
        },
        // Force enable pronouns component ignoring the experiment value
        {
            find: ".Messages.USER_POPOUT_PRONOUNS",
            replacement: {
                match: /\.showPronouns/,
                replace: ".showPronouns||true"
            }
        }
    ],

    options: {
        pronounsFormat: {
            type: OptionType.SELECT,
            description: "The format for pronouns to appear in chat",
            options: [
                {
                    label: "Lowercase",
                    value: PronounsFormat.Lowercase,
                    default: true
                },
                {
                    label: "Capitalized",
                    value: PronounsFormat.Capitalized
                }
            ]
        },
        showSelf: {
            type: OptionType.BOOLEAN,
            description: "Enable or disable showing pronouns for the current user",
            default: true
        },
        showInMessages: {
            type: OptionType.BOOLEAN,
            description: "Show in messages",
            default: true
        },
        showInProfile: {
            type: OptionType.BOOLEAN,
            description: "Show in profile",
            default: true
        }
    },
    settingsAboutComponent: PronounsAboutComponent,

    start() {
        addContextMenuPatch("user-context", userContextMenuPatch);
    },
    stop() {
        removeContextMenuPatch("user-context", userContextMenuPatch);
    },

    // Re-export the components on the plugin object so it is easily accessible in patches
    PronounsChatComponentWrapper,
    CompactPronounsChatComponentWrapper,
    PronounsProfileWrapper
});

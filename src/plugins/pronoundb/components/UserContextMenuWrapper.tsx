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

import { openModal } from "@utils/modal";
import { Menu, React } from "@webpack/common";
import { User } from "discord-types/general";

import { fetchPronouns } from "../pronoundbUtils";
import EditUserPronounsModal from "./EditUserPronounsModal";


export default function UserContextMenuWrapper({ user }: { user: User; }, component: JSX.Element) {
    const categories: JSX.Element = component.props.children[0]; // First should always be the normal elements, children[1] should always be dev mode "Copy ID" btn
    const topCategory: JSX.Element = categories.props.children.find(
        c =>
            c?.type?.name === "MenuGroup" // Find the first menu group
            && c?.props?.children.some( // That has children which are actual menu items
                cc =>
                    cc?.type?.name === "MenuItem"
            )
    );

    topCategory.props.children.push(
        <Menu.MenuItem
            id="edit-user-pronouns"
            key="edit-user-pronouns"
            label="Edit user pronouns"
            action={async () => {
                const pronouns = await fetchPronouns(user.id);

                openModal(modalProps => {
                    return <EditUserPronounsModal user={user} pronouns={pronouns} {...modalProps} />;
                });
            }}
        />
    );
    return component;
}

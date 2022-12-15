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

import { ModalContent, ModalHeader, ModalProps, ModalRoot, ModalSize } from "@utils/modal";
import { React, Select, Switch, Text } from "@webpack/common";
import { User } from "discord-types/general";

import { formatPronouns, saveCustomPronouns } from "../pronoundbUtils";
import { PronounCode, PronounMapping } from "../types";

export default function EditUserPronounsModal(props: ModalProps & { user: User; pronouns: PronounCode; }) {
    const [state, setState] = React.useState(props.pronouns);

    return <ModalRoot size={ModalSize.SMALL} {...props}>
        <ModalHeader>
            <Text variant="heading-md/bold">Edit pronouns for {props.user.tag}</Text>
        </ModalHeader>
        <ModalContent style={{ marginBottom: 10, marginTop: 10, marginRight: 8, marginLeft: 8 }}>
            <Text variant="text-md/medium">User pronouns:</Text>
            <Select
                options={
                    [
                        {
                            label: "Use PronounDB",
                            value: "none",
                            default:
                        },
                        ...Object.entries(PronounMapping).map(([k, v]) => ({
                            label: formatPronouns(k as keyof typeof PronounMapping),
                            value: k,
                            default: k === state
                        }))
                    ]
                }
                placeholder={"Select pronouns"}
                maxVisibleItems={5}
                closeOnSelect={true}
                select={v => {
                    setState(v);
                    saveCustomPronouns(props.user.id, v);
                    // SAVE
                }}
                isSelected={v => v === state}
                serialize={v => v}
            />
        </ModalContent>
    </ModalRoot>;
}

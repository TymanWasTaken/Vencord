/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

import { DataStore } from "@api/index";
import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot } from "@utils/modal";
import { Button, Flex, Forms, React, Select } from "@webpack/common";

import { setCachedPronouns } from "../pronoundbUtils";
import { PronounCode, PronounMapping } from "../types";

export default function SetPronounsModal(props: ModalProps & { defaultPronouns: PronounCode; userId: string; }) {
    const [pronouns, setPronouns] = React.useState<PronounCode | "default">("default");

    return (
        <ModalRoot {...props}>
            <ModalHeader>
                <Forms.FormTitle tag="h4">Set user pronouns</Forms.FormTitle>
            </ModalHeader>

            <ModalContent>
                <Forms.FormTitle tag="h5" style={{ marginTop: "10px" }}>Pronouns</Forms.FormTitle>
                <Select
                    options={
                        [
                            {
                                label: "Default",
                                value: "default"
                            },
                            ...Object.entries(PronounMapping).filter(([code]) => code !== "unspecified").map(([code, pronouns]) => ({
                                label: pronouns,
                                value: code
                            }))
                        ]
                    }
                    maxVisibleItems={5}
                    closeOnSelect={true}
                    select={v => {
                        setPronouns(v);
                    }}
                    isSelected={v => v === pronouns}
                    serialize={v => v}
                />
            </ModalContent>

            <ModalFooter>
                <Flex flexDirection="column" style={{ width: "100%", marginLeft: "auto" }}>
                    <Button
                        color={Button.Colors.GREEN}
                        onClick={async () => {
                            setCachedPronouns({ [props.userId]: pronouns === "default" ? undefined : pronouns });
                            await DataStore.update<Record<string, PronounCode>>("pronoundb-overrides", overrides => {
                                overrides ??= {};
                                if (pronouns === "default") delete overrides[props.userId];
                                else overrides[props.userId] = pronouns;
                                return overrides;
                            });
                            props.onClose();
                        }}
                    >
                        Save & Close
                    </Button>
                    <Button
                        color={Button.Colors.TRANSPARENT}
                        look={Button.Looks.LINK}
                        onClick={() => {
                            props.onClose();
                        }}
                    >
                        Cancel
                    </Button>
                </Flex>
            </ModalFooter>
        </ModalRoot>
    );
}

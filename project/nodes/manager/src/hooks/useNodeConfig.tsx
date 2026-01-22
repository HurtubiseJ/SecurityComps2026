import type { MasterConfig } from "../types/configs";

type NodeConfigProps = {
    type: "proxy" | "attacker" | "target",
    config: MasterConfig
}

export default function useNodeConfig({
    type,
    config
} : NodeConfigProps) {

    //Set current Node (Switch configs)

    //Push config

    //Modify Field

    //Get right panel React Nodes


    return {
        type, config
    }


}   
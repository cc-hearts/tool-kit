import {TransitionProps} from "@/features/word-translation/helper";
import {firstWordLowerCase, firstWordUpperCase} from "@/utils/str";
import {Snippet} from "@nextui-org/react";


export function TransWordCase({text = '', type}: TransitionProps) {
    let code
    switch (type) {
        case "camel":
            code = text.split(' ').map((target, index) => index > 0 ? firstWordUpperCase(target) : firstWordLowerCase(target)).join('')
            break
        case 'kebab':
            code = text.split(' ').map((_, index) => index === 0 ? firstWordLowerCase(_) : _.toLowerCase()).join('-')
            break
        case 'pascal':
            code = text.split(' ').map((_ => firstWordUpperCase(_))).join('')
            break
        case 'snake':
            code = text.split(' ').join('_')
            break
        case 'upper':
            code = text.toUpperCase()
            break
        case 'lower':
            code = text.toLowerCase()
            break
        case 'enum':
            code = text.split(' ').map(_ => _.toUpperCase()).join('_')
            break
    }

    return <div className="flex justify-center flex-col">
        <div>{type}</div>
        <Snippet symbol="" variant="bordered" classNames={{pre: 'word-snippet'}}>{code}</Snippet>
    </div>
}
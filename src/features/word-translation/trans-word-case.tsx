import { TRANSITION_TYPE, TransitionProps } from "@/features/word-translation/helper";
import { firstWordLowerCase, firstWordUpperCase } from "@/utils/str";
import { Snippet } from "@nextui-org/react";

export function TransWordCase({ text = '', type, onTrack }: TransitionProps & { onTrack: (type: TRANSITION_TYPE) => void }) {
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
      code = text.replaceAll('-', '_').split(' ').map(_ => _.toUpperCase()).join('_')
      break
  }

  const validationOfReportedData = () => {
    onTrack(type)
  }

  return <div className="flex justify-center flex-col">
    <div>{type}</div>
    <Snippet variant="bordered" classNames={{ pre: 'word-snippet' }} onCopy={validationOfReportedData}>{code}</Snippet>
  </div>
}

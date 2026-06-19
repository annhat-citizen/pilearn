import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs, defaultProps } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote, createReactBlockSpec } from "@blocknote/react";

const GameBlock = createReactBlockSpec(
  {
    type: "game",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      url: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      if (!props.block.props.url) return null;
      return (
        <div className="w-full my-6 bg-blue-50/50 p-4 rounded-3xl border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-900 mb-4 px-2">Trò Chơi / Mô phỏng</h3>
          <div className="w-full h-[600px] bg-white rounded-2xl overflow-hidden shadow-inner flex flex-col relative">
            <iframe src={props.block.props.url} className="w-full h-full border-0 absolute inset-0" allowFullScreen />
          </div>
        </div>
      );
    },
  }
);

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    game: GameBlock(),
  },
});

export function BlockViewer({ blocks }: { blocks: any[] }) {
  const editor = useCreateBlockNote({ 
    schema,
    initialContent: Array.isArray(blocks) && blocks.length > 0 ? blocks : undefined
  });

  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}


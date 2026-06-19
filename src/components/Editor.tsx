import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems, defaultProps } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote, createReactBlockSpec, SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { useEffect, useState, useRef } from "react";

interface EditorProps {
  initialContent?: string | any[];
  onChange: (content: any[]) => void;
}

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
      return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 my-2">
          <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Nhúng Trò Chơi / Mô phỏng</div>
          {props.block.props.url ? (
            <div className="relative">
              <iframe src={props.block.props.url} className="w-full h-[400px] border-0 rounded-md" />
              <button 
                onClick={() => props.editor.updateBlock(props.block, { type: "game", props: { url: "" } })}
                className="absolute top-2 right-2 bg-white text-red-500 text-xs px-2 py-1 rounded shadow"
              >
                Đổi URL
              </button>
            </div>
          ) : (
            <input 
              type="text"
              placeholder="Nhập link (URL) trò chơi hoặc mô phỏng..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  props.editor.updateBlock(props.block, { type: "game", props: { url: e.currentTarget.value } });
                }
              }}
              onBlur={(e) => {
                props.editor.updateBlock(props.block, { type: "game", props: { url: e.target.value } });
              }}
            />
          )}
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

const insertGame = (editor: any) => ({
  title: "Trò Chơi (Game/Mô phỏng)",
  onItemClick: () => {
    const curPos = editor.getTextCursorPosition();
    if (!curPos) return;
    const curBlock = curPos.block;
    if (curBlock.content && (curBlock.content as any).length > 0) {
      editor.insertBlocks([{ type: "game" as any }], curBlock, "after");
    } else {
      editor.replaceBlocks([curBlock], [{ type: "game" as any }]);
    }
  },
  aliases: ["game", "play", "tro choi"],
  group: "Media",
  icon: <span className="text-xl">🎮</span>,
});


export function Editor({ initialContent, onChange }: EditorProps) {
  const editor = useCreateBlockNote({
    schema,
    initialContent: Array.isArray(initialContent) ? initialContent : undefined,
  });

  const loadedRef = useRef(false);

  useEffect(() => {
    async function load() {
      if (loadedRef.current) return;
      
      if (typeof initialContent === "string" && initialContent) {
        const blocks = await editor.tryParseMarkdownToBlocks(initialContent);
        if (blocks && blocks.length > 0) {
          editor.replaceBlocks(editor.document, blocks);
        }
      } else if (Array.isArray(initialContent) && initialContent.length > 0) {
        editor.replaceBlocks(editor.document, initialContent);
      }
      loadedRef.current = true;
    }
    
    load();
  }, [initialContent, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[300px] bg-white">
      <BlockNoteView 
        editor={editor} 
        onChange={() => {
          onChange(editor.document);
        }}
        theme="light"
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(
              [...getDefaultReactSlashMenuItems(editor), insertGame(editor)],
              query
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}


import React, { useCallback, useMemo, useRef, useState } from "react";

type VisionItem = {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
};

type TextElement = {
  id: string;
  text: string;
};

type ExportPayload = {
  visionItems: VisionItem[];
  textElements: TextElement[];
};

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const VisionBoard: React.FC = () => {
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [newText, setNewText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Add images
  const handleAddImages = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      const next: VisionItem[] = files.map((file) => {
        const url = URL.createObjectURL(file);
        return { id: makeId(), imageUrl: url, title: file.name };
      });

      setVisionItems((prev) => [...prev, ...next]);

      // clear value so selecting the same file again triggers change
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  // Add simple text sticky
  const handleAddText = useCallback(() => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const item: TextElement = { id: makeId(), text: trimmed };
    setTextElements((prev) => [item, ...prev]);
    setNewText("");
  }, [newText]);

  // Remove an image card
  const removeVisionItem = useCallback((id: string) => {
    setVisionItems((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item?.imageUrl?.startsWith("blob:")) {
        // Revoke object URL when removing
        try {
          URL.revokeObjectURL(item.imageUrl);
        } catch {
          /* noop */
        }
      }
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  // Remove a text sticky
  const removeTextElement = useCallback((id: string) => {
    setTextElements((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Export JSON
  const handleExportData = useCallback(() => {
    const payload: ExportPayload = { visionItems, textElements };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vision-board-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  // Import JSON
  const handleImportData = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result ?? "{}")) as Partial<ExportPayload>;
          const importedImages = Array.isArray(parsed.visionItems)
            ? parsed.visionItems.map((v) => ({
                id: v.id ?? makeId(),
                imageUrl: v.imageUrl ?? "",
                title: v.title ?? "",
                description: v.description ?? "",
              }))
            : [];

          const importedTexts = Array.isArray(parsed.textElements)
            ? parsed.textElements.map((t) => ({
                id: t.id ?? makeId(),
                text: t.text ?? "",
              }))
            : [];

          setVisionItems(importedImages);
          setTextElements(importedTexts);
        } catch (err) {
          console.error("Import failed:", err);
          alert("Import failed: invalid JSON.");
        }
      };
      reader.readAsText(file);

      // clear value so selecting the same file again triggers change
      if (importInputRef.current) importInputRef.current.value = "";
    },
    []
  );

  // Clear all
  const handleClearAll = useCallback(() => {
    // Revoke any object URLs to avoid leaks
    visionItems.forEach((it) => {
      if (it.imageUrl?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(it.imageUrl);
        } catch {
          /* noop */
        }
      }
    });
    setVisionItems([]);
    setTextElements([]);
  }, [visionItems]);

  const hasContent = useMemo(
    () => visionItems.length > 0 || textElements.length > 0,
    [visionItems.length, textElements.length]
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vision Board</h1>
          <p className="text-sm text-gray-500">
            Add images and short statements. Export/Import as JSON to back up or reuse.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center px-3 py-2 rounded border border-gray-300 text-sm cursor-pointer hover:bg-gray-50">
            Add images
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddImages}
            />
          </label>

          <button
            type="button"
            onClick={handleExportData}
            className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
            disabled={!hasContent}
            title={hasContent ? "Export your vision board to JSON" : "Nothing to export"}
          >
            Export
          </button>

          <label className="inline-flex items-center px-3 py-2 rounded border border-gray-300 text-sm cursor-pointer hover:bg-gray-50">
            Import
            <input
              ref={importInputRef}
              className="hidden"
              type="file"
              accept="application/json"
              onChange={handleImportData}
            />
          </label>

          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2 rounded border border-red-300 text-sm text-red-700 hover:bg-red-50"
            disabled={!hasContent}
            title={hasContent ? "Clear all items" : "Board is already empty"}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a short vision statement..."
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddText}
          className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
          disabled={!newText.trim()}
        >
          Add Text
        </button>
      </div>

      {/* Board */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Text elements */}
        {textElements.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-gray-200 p-3 bg-yellow-50 shadow-sm flex items-start justify-between"
          >
            <p className="text-sm whitespace-pre-wrap">{t.text}</p>
            <button
              type="button"
              onClick={() => removeTextElement(t.id)}
              className="ml-3 text-xs text-gray-500 hover:text-red-600"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Image cards */}
        {visionItems.map((card) => (
          <div key={card.id} className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="aspect-video bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl}
                alt={card.title ?? "Vision image"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{card.title ?? "Untitled"}</p>
                  {card.description ? (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{card.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeVisionItem(card.id)}
                  className="ml-3 text-xs text-gray-500 hover:text-red-600"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!hasContent && (
          <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
            Add images or a short statement to start building your vision board.
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionBoard;

"use client";
import { xml2json, js2xml } from "xml-js";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
export default function Page() {
  const [svgStr, setSvgStr] = useState("");
  const traversePathFill = (node: any) => {
    if (!node) return;

    if (node.name === "path") {
      if (node.attributes?.fill) {
        node.attributes.fill = "currentColor";
      }

      if (node.attributes?.stroke) {
        node.attributes.stroke = "currentColor";
      }
    }

    if (Array.isArray(node.elements)) {
      node.elements = node.elements.filter((target: any) => {
        return target.name !== "title";
      });

      node.elements.forEach((target: any) => {
        traversePathFill(target);
      });
    }
  };

  const node = xml2json(svgStr);
  const js = JSON.parse(node);
  traversePathFill(js);
  const value = js2xml(js);
  return (
    <div className="flex items-center ">
      <div className="flex-1">
        <Textarea
          value={svgStr}
          onChange={(data) => {
            setSvgStr(data.target.value);
          }}
        />
      </div>
      <div className="flex-1">
        <Textarea value={value} />
      </div>
    </div>
  );
}

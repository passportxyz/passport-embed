import { useMemo } from "react";
import DOMPurify, { ElementHook } from "dompurify";
import parse from "html-react-parser";

const passportPurify = DOMPurify();

const afterSanitizeAttributes: ElementHook = (node) => {
  // set all elements owning target to target=_blank and rel=noopener
  // otherwise DOMPurify removes the target attribute
  if ("target" in node) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener");
  }
};

const sanitize = (html: string) => {
  passportPurify.addHook("afterSanitizeAttributes", afterSanitizeAttributes);

  const sanitizedHTML = passportPurify.sanitize(html);

  passportPurify.removeHook("afterSanitizeAttributes");

  return sanitizedHTML;
};

export const SanitizedHTMLComponent = ({ html }: { html: string }) => {
  return useMemo(() => html && parse(sanitize(html)), [html]);
};

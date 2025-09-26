import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { PythonPlayground } from '../python-playground/python-playground';

// TipTap Node for embedding Python playgrounds
export const PythonPlaygroundExtension = Node.create({
  name: 'pythonPlayground',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      playgroundId: {
        default: null,
      },
      title: {
        default: 'Python Playground',
      },
      description: {
        default: '',
      },
      code: {
        default: '# Python Code Playground\nprint("Hello, World!")',
      },
      height: {
        default: '400px',
      },
      showFullscreen: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-python-playground]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        'data-python-playground': '',
        'data-playground-id': HTMLAttributes.playgroundId,
        'data-title': HTMLAttributes.title,
        'data-description': HTMLAttributes.description,
        'data-code': HTMLAttributes.code,
        'data-height': HTMLAttributes.height,
        'data-show-fullscreen': HTMLAttributes.showFullscreen,
      },
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PythonPlaygroundComponent);
  },
});

// React component for the playground node view
function PythonPlaygroundComponent({ node, updateAttributes }: any) {
  const handleSave = async (code: string, title: string, description: string) => {
    // Update the node attributes
    updateAttributes({
      code,
      title,
      description,
    });

    // If this playground is associated with a module and has an ID, save to backend
    if (node.attrs.playgroundId) {
      try {
        const response = await fetch(`/api/python-playgrounds/${node.attrs.playgroundId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description,
            code,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save playground');
        }
      } catch (error) {
        console.error('Error saving playground:', error);
        throw error; // Let the PythonPlayground component handle the error
      }
    }
  };

  return (
    <NodeViewWrapper className="python-playground-wrapper my-6">
      <div className="border-2 border-dashed border-neural-primary/20 rounded-lg p-1">
        <PythonPlayground
          title={node.attrs.title}
          description={node.attrs.description}
          initialCode={node.attrs.code}
          onSave={handleSave}
          showFullscreen={node.attrs.showFullscreen}
          className="min-h-[400px]"
        />
      </div>
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

// Utility function to insert a Python playground into the editor
export const insertPythonPlayground = (editor: any, attributes: any = {}) => {
  if (!editor) return;

  const defaultAttributes = {
    playgroundId: null,
    title: 'Python Playground',
    description: '',
    code: `# Python Code Playground
# Write your code here and click Run to execute

print("Hello, Python!")

# Example: Simple calculation
x = 10
y = 20
result = x + y
print(f"The sum of {x} and {y} is {result}")
`,
    height: '400px',
    showFullscreen: true,
    ...attributes,
  };

  editor
    .chain()
    .focus()
    .insertContent({
      type: 'pythonPlayground',
      attrs: defaultAttributes,
    })
    .run();
};

// Helper function to create a Python playground from existing code
export const createPlaygroundFromCode = (code: string, title?: string, description?: string) => {
  return {
    playgroundId: null,
    title: title || 'Python Code Example',
    description: description || '',
    code,
    height: '400px',
    showFullscreen: true,
  };
};

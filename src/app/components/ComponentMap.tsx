/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
import React, { useState } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { pointRadial } from 'd3-shape';
import useForceUpdate from './useForceUpdate';
import LinkControls from './LinkControls';
import getLinkComponent from './getLinkComponent';

// setting the base margins for the Map to render in the Chrome extension window.
const defaultMargin = { top: 30, left: 30, right: 30, bottom: 30 };

// export these types because this will only be used on this page, interface not needed as it will not be re-used.
export type LinkTypesProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  snapshots: [];
};

export default function ComponentMap({
  // importing props
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
  snapshots: snapshots,
}: LinkTypesProps) {
  console.log(totalHeight);

  // This is where we select the last object in the snapshots array from props to allow hierarchy to parse the data for render on the component map per hierarchy layout specifications.
  const lastNode = snapshots.length - 1;
  const data = snapshots[lastNode];
  // importing custom hooks for the selection tabs.
  const [layout, setLayout] = useState<string>('cartesian');
  const [orientation, setOrientation] = useState<string>('horizontal');
  const [linkType, setLinkType] = useState<string>('diagonal');
  const [stepPercent, setStepPercent] = useState<number>(10);
  const forceUpdate = useForceUpdate();

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;

  let origin: { x: number; y: number };
  let sizeWidth: number;
  let sizeHeight: number;

  // Conditional statement sets the location of the root node in the middle of the window
  // Else statement sets the location of the root node to the right or top of the window per dropdown selection.
  if (layout === 'polar') {
    origin = {
      x: innerWidth / 2,
      y: innerHeight / 2,
    };
    sizeWidth = 2 * Math.PI;
    sizeHeight = Math.min(innerWidth, innerHeight) / 2;
  } else {
    origin = { x: 0, y: 0 };
    if (orientation === 'vertical') {
      sizeWidth = innerWidth;
      sizeHeight = innerHeight;
    } else {
      sizeWidth = innerHeight;
      sizeHeight = innerWidth;
    }
  }

  // render controls for the map
  // svg - complete layout of self contained component map
  // Tree is rendering each component from the component tree.
  // rect- Contains both text and rectangle node information for rendering each component on the map.
  // circle- setup and layout for the root node.
  const LinkComponent = getLinkComponent({ layout, linkType, orientation });
  return totalWidth < 10 ? null : (
    <div>
      <LinkControls
        layout={layout}
        orientation={orientation}
        linkType={linkType}
        stepPercent={stepPercent}
        setLayout={setLayout}
        setOrientation={setOrientation}
        setLinkType={setLinkType}
        setStepPercent={setStepPercent}
      />

      <svg width={totalWidth} height={totalHeight}>
        <LinearGradient id='links-gradient' from='#fd9b93' to='#fe6e9e' />
        <rect width={totalWidth} height={totalHeight} rx={14} fill='#242529' />
        <Group top={margin.top} left={margin.left}>
          <Tree
            root={hierarchy(data, (d) => (d.isExpanded ? null : d.children))}
            size={[sizeWidth, sizeHeight]}
            separation={(a, b) => (a.parent === b.parent ? 10 : 0) / a.depth}
          >
            {(tree) => (
              <Group top={origin.y} left={origin.x}>
                {tree.links().map((link, i) => (
                  <LinkComponent
                    key={i}
                    data={link}
                    percent={stepPercent}
                    stroke='rgb(254,110,158,0.6)'
                    strokeWidth='1'
                    fill='none'
                  />
                ))}
                translate
                {tree.descendants().map((node, key) => {
                  const width = 40;
                  const height = 15;

                  let top: number;
                  let left: number;
                  if (layout === 'polar') {
                    const [radialX, radialY] = pointRadial(node.x, node.y);
                    top = radialY;
                    left = radialX;
                  } else if (orientation === 'vertical') {
                    top = node.y;
                    left = node.x;
                  } else {
                    top = node.x;
                    left = node.y;
                  }

                  return (
                    <Group top={top} left={left} key={key}>
                      {node.depth === 0 && (
                        <circle
                          r={12}
                          fill="url('#links-gradient')"
                          onClick={() => {
                            node.data.isExpanded = !node.data.isExpanded;
                            forceUpdate();
                          }}
                        />
                      )}
                      {node.depth !== 0 && (
                        <rect
                          height={height}
                          width={width}
                          y={-height / 2}
                          x={-width / 2}
                          fill='#272b4d'
                          stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                          strokeWidth={1}
                          strokeDasharray={node.data.children ? '0' : '2,2'}
                          strokeOpacity={node.data.children ? 1 : 0.6}
                          rx={node.data.children ? 0 : 10}
                          onClick={() => {
                            node.data.isExpanded = !node.data.isExpanded;

                            forceUpdate();
                          }}
                        />
                      )}
                      <text
                        dy='.33em'
                        fontSize={9}
                        fontFamily='Arial'
                        textAnchor='middle'
                        style={{ pointerEvents: 'none' }}
                        fill={
                          node.depth === 0
                            ? '#71248e'
                            : node.children
                            ? 'white'
                            : '#26deb0'
                        }
                      >
                        {node.data.name}
                      </text>
                    </Group>
                  );
                })}
              </Group>
            )}
          </Tree>
        </Group>
      </svg>
    </div>
  );
}

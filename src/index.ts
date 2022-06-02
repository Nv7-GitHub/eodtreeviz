//import { hierarchy, descending } from 'd3';
//import { Tree } from './tree';
//import { Tree } from './radial-tree';
import Sunburst from 'sunburst-chart';

const elem = 235052;
const collapse = true; // Gets rid of the children of nodes after they are displayed somewhere, lower quality but much faster

type Element = {
  ID: number,
  Name: string,
  Parents: number[],
  TreeSize: number,
  Color: number,
}

let cache: Map<number, any> = new Map();

function build_tree(data: Record<number, Element>, id: number): any {
  if (cache.has(id)) {
    return cache.get(id);
  }

  let el = data[id];
  let parents = [];
  for (let parent of el.Parents) {
    parents.push(build_tree(data, parent));
  }

  let children = {};
  if (!collapse) {
    children = {children: parents};
  }

  let val = {
    name: el.Name,
    value: el.TreeSize,
    color: el.Color,
    id: el.ID,
    ...children,
  }

  if (!collapse) {
    for (var par of parents) {
      val.value += par.value;
    }

    if (parents.length == 0) {
      val.value = 1;
    }
  }
  cache.set(id, val);

  return { ...val, children: parents};
}

async function main() {
  console.log("Loading...");
  let data = await (await fetch("/data.json")).json();
  let tree = build_tree(data, elem);
  //let hier = hierarchy(tree);
  console.log("Built hierarchy");

  // Uncomment the commented things to have different types of graphs
  /*const size = document.documentElement.clientWidth * 3;
  // @ts-ignore
  let chart = Tree(hier, {
    label: (d: any) => d.data.name,
    width: size,
    height: size,
  });
  document.body.appendChild(chart);*/

  const chart = Sunburst();
  let conf = chart.data(tree).color((d) => "#" + d.color.toString(16)).maxLevels(25).tooltipContent(d => `ID: ${d.id}, Size: ${d.value}`);
  conf(document.body);
}

main();
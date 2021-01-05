// <NDepthList
//   // object whose keys we want to enumerate
//   obj={obj}
//
//   // starting path
//   path={path}
//
//   // the pattern which will match keys at n depth
//   idPattern={/^ID/}
//
//   // the component to render keys up to n-1
//   renderCategory={(key, object, children) =>
//     <li>{props.children}</li>
//   }
//
//   // the component to render the object at n depth
//   renderItem={(key, object) =>
//     <p>{props.children}</p>
//     }
//   />

const NDepthList = props => {
  const listToBottom = (path, obj) => {
    if (!obj.children) return [];
    const entries = Object.entries(obj.children);

    if (entries.length === 0) return [];

    if (entries[0][0].match(props.idPattern)) {
      return entries.map(([key, value]) =>
        props.renderItem([...path, "children", key], value)
      );
    }

    return entries.map(([key, value]) =>
      props.renderCategory(
        [...path, "children", key],
        value,
        listToBottom([...path, "children", key], value)
      )
    );
  };

  return listToBottom(props.path, props.obj);
};

export default NDepthList;

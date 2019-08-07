
export default class ReadUtil{

    static strMapToObj = (strMap)=> {
        let obj = Object.create(null);
        for (let [k,v] of strMap) {
          obj[k] = v;
        }
        return obj;
      }
}
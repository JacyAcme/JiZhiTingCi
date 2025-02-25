import Section from "../common/Section";
import _util from "../../../common/util";


const Realm = require('realm');
const uuidv4 = require('uuid/v4');

//总结： realm 1对多
// 1. 建表
// 2. 插入 （插入对象，该对象引用的数组对象自动插入；）
// 3. 查询 （关联查询，通过引用获取到数组对象；）
// 4. 修改 （获取到对象，修改属性，自动自动持久化；）
// 5. 删除 （获取到对象，便可删除；不会级联删除；）
// 6. filtered 过滤的得到是Realm.Results


// 1. 生词本表
const VocaGroupSchema = {
    name: 'VocaGroup',
    primaryKey: 'id',
    properties: {
        id: 'string',                      //生词本id
        groupName: 'string?',               //生词本名称
        count: { type: 'int', optional: true, default: 0 },                //生词数
        isDefault: { type: 'bool', optional: true, default: false },        //是否是默认生词本
        listenTimes: { type: 'int', optional: true, default: 0 }, //听的遍数
        testTimes: { type: 'int', optional: true, default: 0 },   //测试遍数
        createTime: 'int?',
        sections: 'GroupSection[]'              //list类型：生词分类
    }
};

//2. 生词分类表（字母分类，或章节分类）
const GroupSectionSchema = {
    name: 'GroupSection',
    primaryKey: 'id',
    properties: {
        id: 'string',
        section: 'string?',
        words: 'GroupWord[]',             //list类型：生词列表    
    }
};


// 3. 生词表
const GroupWordSchema = {
    name: 'GroupWord',
    primaryKey: 'id',
    properties: {
        id: 'string',
        word: 'string?',
        isHidden: { type: 'bool', optional: true, default: false },
        enPhonetic: 'string?',
        enPronUrl: 'string?',
        amPhonetic: 'string?',
        amPronUrl: 'string?',
        translation: 'string?'
    }
};


export default class VocaGroupDao {

    constructor() {
        this.realm = null
    }

    //单例模式
    static getInstance() {
        if (!this.instance) {
            this.instance = new VocaGroupDao();
        }
        return this.instance;
    }

    /**
     * 打开数据库
     * @returns {Promise<null>}
     */
    async open() {
        try {
            if (!this.realm) {
                this.realm = await Realm.open({ path: 'VocaGroup.realm', schema: [GroupWordSchema, GroupSectionSchema, VocaGroupSchema] })
            }
        } catch (err) {
            console.log('Error:打开realm数据库失败, 创建VocaGroupDao对象失败')
            console.log(err)
        }
        return this.realm;
    }

    /**
     * 判断生词本是否关闭
     * @returns {boolean}
     */
    isOpen() {
        return (this.realm !== null)
    }

    /**
     * 关闭数据库
     */
    close = () => {
        if (this.realm && !this.realm.isClosed) {
            this.realm.close()
            this.realm = null
        }
    }



    /**
     *  批量保存生词本数据
     */
    saveVocaGroups = (vocaGroups) => {
        this.realm.write(() => {
            for (let vg of vocaGroups) {
                let group = {
                    id: vg.id,                          //生词本id ()
                    groupName: vg.groupName,            //生词本名称
                    count: vg.count,                     //生词数
                    createTime: vg.createTime,
                    isDefault: vg.isDefault,
                    listenTimes: vg.listenTimes,
                    testTimes: vg.testTimes,
                    sections: [],
                }
                //分组section
                const sectionClass = new Section()
                for (let newWord of vg.newWords) {
                    sectionClass.pushWord(newWord.word, newWord.isHidden)
                }
                group.sections = sectionClass.getSections()
                //保存
                this.realm.create('VocaGroup', group);
            }
        })

    }

    /**
     * 添加生词本
     * @param groupName
     * @returns {boolean} 如果重名,添加失败，则返回false；否则返回true
     */
    addGroup = (groupName) => {

        let group = {
            id: _util.generateMixed(3) + Date.now(),                 //生词本id
            groupName: groupName,         //生词本名称
            count: 0,                    //生词数
            createTime: new Date().getTime(),
            sections: [],                     //list类型：生词列表
        }
        this.realm.write(() => {
            this.realm.create('VocaGroup', group);
        })
        return group
    }




    /**
     * 删除生词本 ，同时删除下面所有单词
     * @param groupId
     * @returns {boolean}
     */
    deleteGroup = (groupId) => {
        let deleteId = null
        this.realm.write(() => {
            let group = this.realm.objects('VocaGroup').filtered('id = "' + groupId + '"')[0];
            if (group) {
                deleteId = group.id
                let sections = group.sections;
                for (let key in sections) {
                    this.realm.delete(sections[key].words)
                }
                this.realm.delete(sections)
                this.realm.delete(group)
            }
        })
        return deleteId
    }


    /**
     * 修改生词本名
     * @param oldName
     * @param newName
     * @returns {boolean} 如果生词本不存在，修改失败，则返回false；否则返回true
     */
    modifyGroupName = (oldName, newName) => {
        let result = null
        this.realm.write(() => {
            let group = this.realm.objects('VocaGroup').filtered('groupName = "' + oldName + '"')[0];
            result = group
            if (group) {
                group.groupName = newName;
            } else {
                throw new Error('生词本不存在，修改失败')
            }
        })
        return result
    }

    /**
     * 修改生词本 listenTimes
     * @param id
     * @param listenTimes
     * @returns 修改失败返回null,成功返回VocaGroup
     */
    modifyListenTimes = (id, listenTimes) => {
        let result = null
        this.realm.write(() => {
            let group = this.realm.objects('VocaGroup').filtered('id = "' + id + '"')[0];
            result = group
            if (group) {
                group.listenTimes = listenTimes;
            } else {
                throw new Error('生词本不存在，修改失败')
            }
        })
        return result
    }
    /**
  * 修改生词本 testTimes
  * @param id
  * @param testTimes
  * @returns 修改失败返回null,成功返回VocaGroup
  */
    modifyTestTimes = (id, testTimes) => {
        let result = null
        this.realm.write(() => {
            let group = this.realm.objects('VocaGroup').filtered('id = "' + id + '"')[0];
            result = group
            if (group) {
                group.testTimes = testTimes;
            } else {
                throw new Error('生词本不存在，修改失败')
            }
        })
        return result
    }


    /**
     * 查询所有生词本
     * @returns {Realm.Results<any> | never}
     */
    getAllGroups = () => {
        return this.realm.objects('VocaGroup');
    }


    /**
     * 获取具体某生词本
     * @param id
     * @returns {any} 
     */
    getGroupById = (id) => {
        return this.realm.objects('VocaGroup').filtered('id = "' + id + '"')[0] || {}
    }

    /**
     * 获取具体某生词本
     * @param groupName
     * @returns {any} 
     */
    getGroupByName = (groupName) => {
        return this.realm.objects('VocaGroup').filtered('groupName = "' + groupName + '"')[0] || {}
    }


    /**
     * 修改为默认生词本
     * @param groupId
     * @returns {boolean} 生词本不存在，修改失败，返回false; 否则返回true
     */
    modifyToDefault = (groupId) => {
        let result = null
        this.realm.write(() => {
            //先取消所有的默认生词本，再设置新的默认生词本（保证唯一）
            let dgs = this.realm.objects('VocaGroup').filtered('isDefault = true')
            for (let dg of dgs) {
                dg.isDefault = false
            }
            let group = this.realm.objects('VocaGroup').filtered('id = "' + groupId + '"')[0];
            if (group) {
                group.isDefault = true;
                result = group
            } else {
                throw new Error('生词本不存在, 修改为默认失败')
            }
        })
        return result;
    }

    /**
     *  判断是否是默认生词本
     * @param groupId
     * @returns 
     */
    isDefault = (groupId) => {
        const defaultGroup = this.realm.objects('VocaGroup').filtered('id = "' + groupId + '"')[0];
        if (defaultGroup) {
            return defaultGroup.isDefault
        }
        return false
    }


    /**
     * 添加生词到默认生词本
     * @param groupWord
     */
    addWordToDefault = (groupWord) => {
        let result = {}
        this.realm.write(() => {
            console.log(`开始添加生词到默认生词本，单词：${groupWord.word}`)
            let defaultGroup = this.realm.objects('VocaGroup').filtered('isDefault = true')[0];
            result = this._addWord(groupWord, defaultGroup)
        })
        return result
    }


    /**
     * 判断单词是否在默认生词本
     * @param word
     * @returns {boolean}
     */
    isExistInDefault = (word) => {
        if (!word) {
            return false
        }
        let isExist = false;
        try {
            let defaultGroup = this.realm.objects('VocaGroup').filtered('isDefault = true')[0];
            if (defaultGroup) {
                for (let s of defaultGroup.sections) {
                    for (let w of s.words) {
                        if (w.word === word) {
                            //如果存在
                            isExist = true
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            isExist = false
            console.log(e)
        }
        return isExist
    }
    /**
    * 判断单词是否在生词本中
    * @param word
    * @param goalGroup
    * @returns {boolean}
    */
    _isExistInGroup = (word, goalGroup) => {
        if (!word) {
            return false
        }
        let isExist = false;
        try {
            if (goalGroup) {
                for (let s of goalGroup.sections) {
                    for (let w of s.words) {
                        if (w.word === word) {
                            //如果存在
                            isExist = true
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            isExist = false
            console.log(e)
        }
        return isExist
    }

    /**
     * 批量添加生词到生词本
     * @param groupWords
     * @param groupName
     */
    batchAddWords = (groupWords, groupName) => {
        let results = []
        this.realm.write(() => {
            const goalGroup = this.realm.objects('VocaGroup').filtered('groupName = "' + groupName + '"')[0];
            if (!goalGroup) {
                throw new Error("目标生词本不存在！")
            } else {
                const gWords = []
                for (let groupWord of groupWords) {
                    if (!this._isExistInGroup(groupWord.word, goalGroup)) {
                        gWords.push(groupWord)
                    } else {
                        console.log(`重复：${groupWord.word}`)
                    }
                }
                for (let groupWord of gWords) {
                    const r = this._addWord(groupWord, goalGroup)
                    if (r.groupId) {
                        results.push(r)
                    }
                }
            }
        })
        return results
    }

    /**
    * 添加生词到生词本的操作
    * @param groupWord
    * @param goalGroup
    */
    _addWord = (groupWord, goalGroup) => {
        let result = {}
        //判断groupWord 所在的分组（即判断第一个字母）
        let isSaved = false
        let firstChar = groupWord.word[0].toUpperCase()
        result.groupId = goalGroup.id
        //如果默认生词本不存在，创建一个默认生词本
        if (!goalGroup) {
            throw new Error("目标生词本不存在！")
        }
        for (let key in goalGroup.sections) {
            let s = goalGroup.sections[key];
            if (s.section === firstChar) {
                console.log(`生词${groupWord.word} 存入生词本 ${goalGroup.groupName} 的section: ${s.section} 中`)
                //如果单词已经存在, 返回false,添加失败
                for (let key2 in s.words) {
                    if (s.words[key2].word === groupWord.word) {
                        console.log('单词已存在，存入失败')
                        success = false
                        //这里的return 是结束realm.write函数
                        return false
                    }
                }
                s.words.push({ ...groupWord, id: uuidv4() })
                goalGroup.count++;
                isSaved = true
                result.addWord = groupWord.word
                console.log('单词存入成功')

                break
            }
        }

        if (!isSaved) {
            console.log(`不存在Section, 创建了一个Section: ${firstChar}`)
            //创建分组，并存入
            let newSection = {
                id: uuidv4(),
                section: firstChar,
                words: [{ ...groupWord, id: uuidv4() }]
            }
            goalGroup.sections.push(newSection);
            goalGroup.count++;
            result.addWord = groupWord.word
            console.log('单词存入成功')
        }
        return result
    }







    /**
     *  从默认生词本移除单词
     * @param word
     * @returns {boolean}
     */
    removeWordFromDefault = (word) => {
        let result = {}
        let defaultGroup = this.realm.objects('VocaGroup').filtered('isDefault = true')[0];
        if (defaultGroup) {
            result.groupId = defaultGroup.id
            this.realm.write(() => {
                let sectionName = word[0].toUpperCase()
                let section = defaultGroup.sections.filtered('section = "' + sectionName + '"')[0];
                if (section) {
                    for (let key in section.words) {
                        let w = section.words[key]
                        if (w && w.word === word) {
                            this.realm.delete(w);
                            defaultGroup.count = defaultGroup.count - 1
                            result.deleteWord = word
                        }
                    }
                } else {
                    throw new Error('删除生词失败，Section不存在')
                }
            })
        } else {
            throw new Error('删除生词失败，生词本不存在')
        }
        return result
    }

    /**
     * 批量删除单词
     * @param groupId
     * @param words 单词数组
     * @returns {object} result 结果信息
     */
    deleteWords = (groupId, words) => {
        let result = { success: true, groupId: null, deletedSections: [], deletedWords: [] }
        let group = this.realm.objects('VocaGroup').filtered('id = "' + groupId + '"')[0];
        if (group) {
            result.groupId = group.id
            try {
                this.realm.write(() => {
                    let delCount = 0
                    for (let word of words) { //遍历所有单词
                        let sectionName = word[0].toUpperCase()
                        let section = group.sections.filtered('section = "' + sectionName + '"')[0];
                        if (section) {
                            for (let key in section.words) {
                                let w = section.words[key]
                                if (w && w.word === word) {
                                    result.deletedWords.push(word)
                                    this.realm.delete(w);
                                    delCount++
                                }
                            }
                            //如果section下没有单词
                            if (section.words.length <= 0) {
                                result.deletedSections.push(section.section)
                                this.realm.delete(section)
                            }
                        }
                    }
                    group.count = group.count - delCount
                })
            } catch (e) {
                result.success = false
                console.log(e)
            }
        } else {
            throw new Error('生词本不存在')
            result.success = false
        }
        return result
    }

    /**
     * 删除所有生词本，清空数据库
     */
    deleteAllGroups = () => {
        this.realm.write(() => {
            this.realm.deleteAll();
        })
    }

}
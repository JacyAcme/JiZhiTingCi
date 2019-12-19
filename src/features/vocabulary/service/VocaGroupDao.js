import Section from "../common/Section";

const Realm = require('realm');
const uuidv4 = require('uuid/v4');

//总结： realm 1对多
// 1. 建表
// 2. 插入 （插入对象，该对象引用的数组对象自动插入；）
// 3. 查询 （关联查询，通过引用获取到数组对象；）
// 4. 修改 （获取到对象，修改属性，自动自动持久化；）
// 5. 删除 （获取到对象，便可删除；不会级联删除；）
// 6. filtered 过滤的得到是Realm.Results
// 7. 关联查询得到的子对象是 Object，支持push, 但不支持for of, forEach
// 8. Realm.Results/Realm.List  支持forEach, for of遍历， push, pop, splice等。 支持filter, map. 还支持一些统计聚合函数



// 1. 生词本表
const VocaGroupSchema = {
    name: 'VocaGroup',
    primaryKey: 'id',
    properties: {
        id: 'string',                      //生词本id
        groupName: 'string?',           //生词本名称
        count: { type: 'int', optional: true, default: 0 },                //生词数
        createTime: 'int?',
        isDefault: { type: 'bool', optional: true, default: false },     //是否是默认生词本
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
        trans: 'string?'
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
     *  保存生词本数据
     */
    saveVocaGroups = (vocaGroups)=>{
        this.realm.write(()=>{
            for(let vg of vocaGroups){
                if (this.getGroup(vg.groupName)) {
                    throw new Error('生词本名字重复了')
                } else{
                    let group = {
                        id: vg.id,                          //生词本id ()
                        groupName: vg.groupName,            //生词本名称
                        count: vg.count,                     //生词数
                        createTime: vg.createTime,
                        isDefault: vg.isDefault,
                        sections: [],                     
                    }
                    //分组section
                    const sectionClass = new Section()
                    for(let newWord of vg.newWords){
                        sectionClass.pushWord(newWord.word,newWord.isHidden)
                    }
                    group.sections = sectionClass.getSections()
                    //保存
                    this.realm.create('VocaGroup', group);
                }
                
            }
        })
        
    }

    /**
     * 添加生词本
     * @param groupName
     * @returns {boolean} 如果重名,添加失败，则返回false；否则返回true
     */
    addGroup = (groupName) => {
        let result = null
        let group = {
            id: uuidv4(),                    //生词本id ()
            groupName: groupName,           //生词本名称
            count: 0,                    //生词数
            createTime: new Date().getTime(),
            sections: [],                     //list类型：生词列表
        }
        //判断是否重名
        if (this.getGroup(groupName)) {
            throw new Error('生词本名字重复了')
        } else {
            this.realm.write(() => {
                this.realm.create('VocaGroup', group);
            })
            result = group
        }
        return result
    }

    /**
     * 修改生词本名
     * @param oldName
     * @param newName
     * @returns {boolean} 如果生词本不存在，修改失败，则返回false；否则返回true
     */
    updateGroupName = (oldName, newName) => {
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
     * 删除生词本 ，同时删除下面所有单词
     * @param groupName
     * @returns {boolean}
     */
    deleteGroup = (groupName) => {
        let id = null
        this.realm.write(() => {
            let group = this.realm.objects('VocaGroup').filtered('groupName = "' + groupName + '"')[0];
            if (group) {
                id = group.id
                let sections = group.sections;
                for (let key in sections) {
                    this.realm.delete(sections[key].words)
                }
                this.realm.delete(sections)
                this.realm.delete(group)
            }
        })
        return id
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
     * @param groupName
     * @returns {any} 不存在返回undetified
     */
    getGroup = (groupName) => {
        return this.realm.objects('VocaGroup').filtered('groupName = "' + groupName + '"')[0];
    }


    /**
     * 修改为默认生词本
     * @param groupName
     * @returns {boolean} 生词本不存在，修改失败，返回false; 否则返回true
     */
    updateToDefault = (groupName) => {
        let id = null
        this.realm.write(() => {
            //先取消所有的默认生词本，再设置新的默认生词本（保证唯一）
            let dgs = this.realm.objects('VocaGroup').filtered('isDefault = true')
            for (let dg of dgs) {
                dg.isDefault = false
            }
            console.log('---------------' + groupName)
            let group = this.realm.objects('VocaGroup').filtered('groupName = "' + groupName + '"')[0];
            if (group) {
                group.isDefault = true;
                id = group.id
            } else {
                throw new Error('生词本不存在, 修改为默认失败')
            }
        })
        return id;
    }

    /**
     *  判断是否是默认生词本
     * @param groupName
     * @returns {boolean|VocaGroupDao.isDefault|VocaGroupSchema.properties.isDefault|{default, optional, type}|boolean}
     */
    isDefault = (groupName) => {
        const defaultGroup = this.realm.objects('VocaGroup').filtered('groupName = "' + groupName + '"')[0];
        if (defaultGroup) {
            return defaultGroup.isDefault
        }
        return false
    }


    /**
     * 添加生词到默认生词本
     * @param groupWord
     * @param groupWord
     */
    addWordToDefault = (groupWord) => {
        let result = {}
        this.realm.write(() => {
            console.log(`开始添加生词到默认生词本，单词：${groupWord.word}`)
            //判断groupWord 所在的分组（即判断第一个字母）
            let isSaved = false
            let firstChar = groupWord.word[0].toUpperCase()
            let defaultGroup = this.realm.objects('VocaGroup').filtered('isDefault = true')[0];
            result.groupId = defaultGroup.id
            //如果默认生词本不存在，创建一个默认生词本
            if (!defaultGroup) {
                let group = {
                    id: uuidv4(),
                    groupName: '默认生词本',
                    count: 0,
                    createTime: new Date().getTime(),
                    isDefault: true,            //设置是默认生词本
                    sections: []
                }
                defaultGroup = this.realm.create('VocaGroup', group);
                console.log(`创建了默认生词本`)
            }
            for (let key in defaultGroup.sections) {
                let s = defaultGroup.sections[key];
                if (s.section === firstChar) {
                    console.log(`生词${groupWord.word} 存入生词本 ${defaultGroup.groupName} 的section: ${s.section} 中`)
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
                    defaultGroup.count++;
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
                defaultGroup.sections.push(newSection);
                defaultGroup.count++;
                result.addWord = groupWord.word
                console.log('单词存入成功')
            }
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
     * @param groupName
     * @param words 单词数组
     * @returns {object} result 结果信息
     */
    deleteWords = (groupName, words) => {
        let result = { success: true, groupId: null, deletedSections: [], deletedWords: [] }
        let group = this.realm.objects('VocaGroup').filtered('groupName = "' + groupName + '"')[0];
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
            console.warn(`${groupName} 生词本不存在`)
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